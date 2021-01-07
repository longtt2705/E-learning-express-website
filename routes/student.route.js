const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.mdw");

router.get("/", auth, isStudent, async (req, res) => {
  res.render("viewStudent/lessons");
});

router.get("/course", auth, isStudent, async (req, res) => {
  res.render("viewStudent/lessons");
});

function isStudent(req, res, next) {
  if (req.session.authUser.RoleId != 2) {
    return res.redirect("../");
  }
  next();
}

module.exports = router;
