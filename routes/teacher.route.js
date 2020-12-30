const express = require("express");
const auth = require("../middlewares/auth.mdw");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const fs = require("fs");
const router = express.Router();

router.get("/", auth, isTeacher, (req, res) => {
  res.render("viewTeacher/courses");
});

router.get("/add", auth, isTeacher, (req, res) => {
  const categories = res.locals.lcCategories;
  const subCate = [];
  for (let cate in categories) {
    categories[cate].SubCate.forEach((element) => {
      subCate.push(element);
    });
  }

  res.render("viewTeacher/courses-add", {
    category: subCate,
  });
});

router.post("/add", auth, isTeacher, (req, res) => {
  const dir = "./public/courses";

  let fileName = null;
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      console.log(req.body);
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      console.log(req.body);
      cb(null, file.originalname);
      fileName = file.originalname;
    },
  });
  const upload = multer({ storage });
  upload.any()(req, res, async function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log(req.files);
      res.redirect("./add");
    }
  });
});

function isTeacher(req, res, next) {
  if (req.session.authUser.RoleId != 3) {
    return res.redirect("../");
  }

  next();
}

module.exports = router;
