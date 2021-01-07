const { async } = require("crypto-random-string");
const express = require("express");
const { route } = require("./course.route");
const router = express.Router();

router.get("/", async (req, res) => {
  res.render("viewStudent/lessons");
});

router.get("/course", async (req, res) => {
  res.render("viewStudent/lessons");
});

module.exports = router;
