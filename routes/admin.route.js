const express = require("express");
const auth = require("../middlewares/auth.mdw");
const bcrypt = require("bcryptjs");
const encryptTimes = 10;
const accountModel = require("../models/account.model");
const config = require("../config/default.json");
const multer = require("multer");
const fs = require("fs");

const router = express.Router();

router.get("/", auth, isAdmin, async function (req, res) {
  const active = getActive("dashboard");
  res.render("viewAdmin/dashboard", {
    layout: "admin.hbs",
    active,
  });
});

router.get("/account", auth, isAdmin, async function (req, res) {
  const active = getActive("account");
  let page = req.query.page || 1;
  const total = await accountModel.countAllWithoutAdmin();

  const totalPage = Math.ceil(total / config.pagination.limit);

  if (page < 1) page = 1;
  if (page > totalPage) page = totalPage;

  const offset = (page - 1) * config.pagination.limit;
  const rows = await accountModel.allWithoutAdminByPage(offset);

  const page_items = [];

  for (let i = 1; i <= totalPage; i++) {
    const page_item = {
      value: i,
      isActive: page == i,
    };

    page_items.push(page_item);
  }

  rows.forEach((e) => {
    e.isVerified = e.StatusId == 4;
  });
  res.render("viewAdmin/account/account", {
    layout: "admin.hbs",
    active,
    items: rows,
    isEmpty: rows.length === 0,
    page_items,
    canGoPrev: page > 1,
    canGoNext: page < totalPage,
    nextPage: page + 1,
    prevPage: page - 1,
  });
});

router.get("/account/search", auth, isAdmin, async (req, res) => {
  const searchType = req.query.search;
  const sort = req.query.sort;
  const order = req.query.order;
  const content = req.query.searchContent;
  const active = getActive("account");
  let rows, total;
  if (searchType === "username")
    total = await accountModel.countAllWithLike(searchType, content);
  else total = await accountModel.countAllWithFullText(searchType, content);
  const totalPage = Math.ceil(total / config.pagination.limit);

  let page = req.query.page || 1;
  if (page < 1) page = 1;
  if (totalPage > 0 && page > totalPage) page = totalPage;
  const offset = (page - 1) * config.pagination.limit;
  if (searchType === "username") {
    rows = await accountModel.searchWithLikeByPage(
      searchType,
      sort,
      order,
      content,
      offset
    );
  } else {
    rows = await accountModel.searchWithFullTextByPage(
      searchType,
      sort,
      order,
      content,
      offset
    );
  }

  const page_items = [];
  for (let i = 1; i <= totalPage; i++) {
    const page_item = {
      value: i,
      isActive: page == i,
    };

    page_items.push(page_item);
  }

  if (rows != null) {
    rows.forEach((e) => {
      e.isVerified = e.StatusId == 4;
    });
  }

  res.render("viewAdmin/account/account", {
    layout: "admin.hbs",
    active,
    items: rows,
    isEmpty: rows.length === 0,
    page_items,
    canGoPrev: page > 1,
    canGoNext: page < totalPage,
    nextPage: page + 1,
    prevPage: page - 1,
  });
});

router.get("/account/add", auth, isAdmin, async function (req, res) {
  const active = getActive("account");
  res.render("viewAdmin/account/account-add", {
    layout: "admin.hbs",
    active,
  });
});

router.post("/account/add", auth, isAdmin, async function (req, res) {
  const hash = bcrypt.hashSync(req.body.password, encryptTimes);
  const account = {
    username: req.body.email,
    password: hash,
    phone: req.body.phone,
    balance: 0.0,
    name: req.body.name,
    image: "avatar.jpg",
    statusid: 4,
    roleid: req.body.roleid,
  };

  await accountModel.add(account);
  res.redirect("../account/add");
});

router.get("/account/edit/:username", auth, isAdmin, async function (req, res) {
  const active = getActive("account");
  let account = await accountModel.singleByUserNameWithoutProvider(
    req.params.username
  );
  account.isStudent = account.RoleId === 2;
  res.render("viewAdmin/account/account-edit", {
    layout: "admin.hbs",
    active,
    account,
  });
});

router.get(
  "/account/edit/upload/:username",
  auth,
  isAdmin,
  async function (req, res) {
    const active = getActive("account");
    let account = await accountModel.singleByUserNameWithoutProvider(
      req.params.username
    );
    account.isStudent = account.RoleId === 2;
    res.render("viewAdmin/account/account-edit-avatar", {
      layout: "admin.hbs",
      active,
      account,
    });
  }
);

router.post("/account/edit/upload/:username", auth, isAdmin, (req, res) => {
  const username = req.params.username;
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
      res.redirect("../" + username);
    }
  });
});

router.post("/account/edit/:user", auth, isAdmin, async function (req, res) {
  const account = await accountModel.singleByUserNameWithoutProvider(
    req.body.email
  );
  account.Phone = req.body.phone;
  account.Name = req.body.name;
  account.Description = req.body.FullDes;
  account.RoleId = req.body.roleid;

  await accountModel.patch(account);
  res.redirect("../");
});

router.post("/account/delete", auth, isAdmin, async function (req, res) {
  const username = req.body.username;

  await accountModel.delete(username);
  res.redirect("../account");
});

const getActive = (name) => {
  let active = {
    coursesWrapper: false,
    dashboardWrapper: false,
    course: false,
    account: false,
    timeline: false,
  };

  active[name] = true;
  if (name === "add" || name === "edit" || name === "detail")
    active.coursesWrapper = true;
  if (name === "course" || name === "account" || name === "timeline")
    active.dashboardWrapper = true;
  return active;
};

function isAdmin(req, res, next) {
  if (req.session.authUser.RoleId != 1) {
    return res.redirect("../");
  }

  next();
}

module.exports = router;
