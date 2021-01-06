const express = require("express");
const auth = require("../middlewares/auth.mdw");

const router = express.Router();

router.get("/", async function (req, res) {
 
    res.render("viewCourseDetail/detail", {
      layout: "main.hbs",
    });
  });

  module.exports = router;