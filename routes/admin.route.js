const express = require("express");
const auth = require("../middlewares/auth.mdw");
const bcrypt = require("bcryptjs");
const encryptTimes = 10;
const accountModel = require("../models/account.model");
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
  const rows = await accountModel.allWithoutAdmin();
  rows.forEach((e) => {
    e.isVerified = e.StatusId == 4;
  });
  res.render("viewAdmin/account/account", {
    layout: "admin.hbs",
    active,
    items: rows,
    isEmpty: rows.length === 0,
  });
});

router.get("/account/add", auth, isAdmin, async function (req, res) {
  const active = getActive("add");
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
  const active = getActive("edit");
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

router.post("/account/edit/:user", auth, isAdmin, async function (req, res) {
  const account = await accountModel.singleByUserNameWithoutProvider(
    req.body.email
  );
  account.Phone = req.body.phone;
  account.Name = req.body.name;
  account.RoleId = req.body.roleid;

  await accountModel.patch(account);
  res.redirect("../");
});

router.post("/account/delete", auth, isAdmin, async function (req, res) {
  const username = req.body.username;

  await accountModel.delete(username);
  res.redirect("../account");
});

router.get("/account/detail", auth, isAdmin, async function (req, res) {
  const active = getActive("detail");
  res.render("viewAdmin/account/account-detail", {
    layout: "admin.hbs",
    active,
  });
});

const getActive = (name) => {
  let active = {
    coursesWrapper: false,
    add: false,
    edit: false,
    detail: false,
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
