const express = require("express");
const bcrypt = require("bcryptjs");
const accountModel = require("../models/account.model");
const auth = require("../middlewares/auth.mdw");
const encryptTimes = 10;
const router = express.Router();
const mailer = require("../middlewares/mailer.mdw");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");

router.get("/login", async function (req, res) {
  if (req.session.isAuth) res.redirect("/");
  if (req.headers.referer) {
    let url = req.headers.referer;
    let isSignUp = url.endsWith("signup");

    if (!isSignUp) {
      req.session.retUrl = req.headers.referer;
    } else req.session.retUrl = "/";
  }
  res.render("viewAccount/login", {
    layout: false,
  });
});

router.post("/login", async function (req, res) {
  const user = await accountModel.singleByUserName(req.body.email);
  if (user === null) {
    return res.render("viewAccount/login", {
      layout: false,
      err_message: "Invalid username or password.",
    });
  }
  const ret = bcrypt.compareSync(req.body.password, user.Password);
  if (ret === false) {
    return res.render("viewAccount/login", {
      layout: false,
      err_message: "Invalid username or password.",
    });
  }
  if (user.StatusId == 6) {
    return res.render("blocked", {
      layout: false,
    });
  }
  // Unverified
  if (user.StatusId === 5) {
    mailer.sendConfirm(user.Username);

    return res.render("viewAccount/confirm", {
      layout: false,
    });
  }

  user.role = {
    isAdmin: user.RoleId == 1,
    isStudent: user.RoleId == 2,
    isTeacher: user.RoleId == 3,
  };
  console.log(user.isAdmin);
  req.session.isAuth = true;
  req.session.authUser = user;

  let url = req.session.retUrl || "/";
  console.log(url);
  res.redirect(url);
});

router.get("/signup", (req, res) => {
  if (req.session.isAuth) res.redirect("/");
  res.render("viewAccount/signup", {
    layout: false,
  });
});

router.get("/is-available", async function (req, res) {
  const email = req.query.user;
  const user = await accountModel.singleByUserName(email);
  if (user === null) {
    return res.json(true);
  }

  res.json(false);
});

router.post("/signup", async function (req, res) {
  const hash = bcrypt.hashSync(req.body.password, encryptTimes);
  const account = {
    username: req.body.email,
    password: hash,
    phone: req.body.phone,
    balance: 100.0,
    name: req.body.name,
    image: "avatar.jpg",
    statusid: 5,
    roleid: 2,
  };

  await accountModel.add(account);
  res.redirect("../account/login");
});

router.post("/logout", (req, res) => {
  req.session.isAuth = false;
  req.session.authUser = null;
  req.session.cart = [];
  res.redirect(req.headers.referer);
});

router.get("/profile/password", auth, (req, res) => {
  res.render("viewAccount/profile-password");
});

router.post("/profile/password", auth, async (req, res) => {
  const oldPassword = req.body["old-password"];
  const newPassword = req.body["new-password"];
  const user = await accountModel.singleByUserNameWithoutProvider(
    req.session.authUser.Username
  );

  const userPassword = user.Password;
  const isPasswordValid = bcrypt.compareSync(oldPassword, userPassword);
  if (isPasswordValid) {
    if (oldPassword === newPassword) {
      return res.render("viewAccount/profile-password", {
        err: "Your old password and new password cannot be the same!",
      });
    } else {
      const hash = bcrypt.hashSync(newPassword, encryptTimes);
      user.Password = hash;
      await accountModel.patch(user);
      return res.render("viewAccount/profile-password", {
        success: "Change password successfully!",
      });
    }
  }

  res.render("viewAccount/profile-password", {
    err: "Your old password is incorrect!",
  });
});

router.get("/profile", auth, (req, res) => {
  res.render("viewAccount/profile");
});

router.get("/profile/upload", auth, (req, res) => {
  res.render("viewAccount/profile-upload");
});

router.post("/profile/upload", auth, (req, res) => {
  const username = req.session.authUser.Username;

  const dir = "./public/img/account/" + username;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  let fileName = null;
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
      fileName = file.originalname;
    },
  });
  const upload = multer({ storage });
  upload.single("fuMain")(req, res, async function (err) {
    if (err) {
      console.log(err);
    } else {
      let user = await accountModel.singleByUserNameWithoutProvider(username);

      user.Image = "account/" + username + "/" + fileName;

      await accountModel.patch(user);
      user.role = { ...req.session.authUser.role };

      req.session.authUser = user;
      res.redirect("/account/profile");
    }
  });
});

router.post("/profile", auth, async function (req, res) {
  const account = await accountModel.singleByUserNameWithoutProvider(
    req.body.email
  );

  account.Phone = req.body.phone;
  account.Name = req.body.name;
  account.Description = req.body.FullDes;

  await accountModel.patch(account);
  account.role = { ...req.session.authUser.role };
  req.session.authUser = account;

  res.redirect("/account/profile");
});

router.get("/confirmation", function (req, res) {
  const token = req.query.token;
  jwt.verify(token, "SECRET_KEY", async function (err, decoded) {
    const email = decoded.data;
    const rows = await accountModel.singleByUserName(email);
    if (rows.StatusId == 6) {
      return res.render("blocked", {
        layout: false,
      });
    }
    rows.StatusId = 4;
    await accountModel.patch(rows);

    req.session.isAuth = true;
    req.session.authUser = await accountModel.singleByUserName(email);
    req.session.authUser.role = {
      isAdmin: false,
      isStudent: true,
      isTeacher: false,
    };
    let url = req.session.retUrl || "/";
    res.redirect(url);
  });
});

module.exports = router;
