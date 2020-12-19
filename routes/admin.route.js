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
  res.render("viewAdmin/account/account", {
    layout: "admin.hbs",
    active,
  });
});

router.get("/account/add", auth, isAdmin, async function (req, res) {
  const active = getActive("add");
  res.render("viewAdmin/account/account-add", {
    layout: "admin.hbs",
    active,
  });
});

router.post("/account/add", async function (req, res) {
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

router.get("/account/edit", auth, isAdmin, async function (req, res) {
  const active = getActive("edit");
  res.render("viewAdmin/account/account-edit", {
    layout: "admin.hbs",
    active,
  });
});

router.get("/account/detail", auth, async function (req, res) {
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
