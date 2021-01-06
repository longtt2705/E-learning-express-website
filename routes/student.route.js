const { async } = require("crypto-random-string");
const express = require("express");
const router = express.Router();

router.get("/course/:courseId/:chapterId/:lessonId", async (req, res) => {
  res.render("viewStudent/lessons");
});

router.get("/course", async (req, res) => {
  res.render("viewStudent/lessons");
});

module.exports = router;
