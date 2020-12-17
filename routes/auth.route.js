const passport = require("passport");
const express = require("express");
const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    accessType: "offline",
    approvalPrompt: "force",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "account/login" }),
  (req, res) => {
    res.redirect("/");
  }
);
module.exports = router;
