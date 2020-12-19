const express = require("express");
const bcrypt = require("bcryptjs");
const accountModel = require("../models/account.model");
const auth = require("../middlewares/auth.mdw");
const encryptTimes = 10;
const router = express.Router();
const mailer = require("../middlewares/mailer.mdw");
const jwt = require("jsonwebtoken");

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
  console.log(user);
  const ret = bcrypt.compareSync(req.body.password, user.Password);
  if (ret === false) {
    return res.render("viewAccount/login", {
      layout: false,
      err_message: "Invalid username or password.",
    });
  }
  // Unverified
  if (user.StatusId === 5) {
    mailer.sendConfirm(user.Username);

    return res.render("viewAccount/confirm", {
      layout: false,
    });
  }

  user.isAdmin = user.RoleId == 1;
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
  res.redirect(req.headers.referer);
});

router.get("/profile", auth, (req, res) => {
  res.render("viewAccount/profile");
});

router.get("/confirmation", function (req, res) {
  const token = req.query.token;
  jwt.verify(token, "SECRET_KEY", async function (err, decoded) {
    const email = decoded.data;
    const rows = await accountModel.singleByUserName(email);
    rows.StatusId = 4;
    await accountModel.updateConfirmEmail(rows);

    req.session.isAuth = true;
    req.session.authUser = await accountModel.singleByUserName(email);

    let url = req.session.retUrl || "/";
    res.redirect(url);
  });
});

module.exports = router;
