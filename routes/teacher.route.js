const express = require("express");
const auth = require("../middlewares/auth.mdw");
const multer = require("multer");
const fs = require("fs");
const config = require("../config/default.json");
const router = express.Router();
const courseModel = require("../models/course.model");
const courseContentModel = require("../models/course-content.model");
const courseContentDetailModel = require("../models/course-content-detail.model");
const moment = require("moment");
const shell = require("shelljs");

router.get("/", auth, isTeacher, async (req, res) => {
  const username = req.session.authUser.Username;
  let page = req.query.page || 1;
  const total = await courseModel.countAllWithUsername(username);

  const totalPage = Math.ceil(total / config.pagination.limit);

  if (page < 1) page = 1;
  if (page > totalPage) page = totalPage;

  const offset = (page - 1) * config.pagination.limit;
  const rows = await courseModel.allWithUsernameByPage(username, offset);

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
  res.render("viewTeacher/courses", {
    items: rows,
    isEmpty: rows.length === 0,
    page_items,
    canGoPrev: page > 1,
    canGoNext: page < totalPage,
    nextPage: page + 1,
    prevPage: page - 1,
  });
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
  const username = req.session.authUser.Username;

  let fileName = null;
  let courseName = null;
  let imageExtension = null;
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      courseName = req.body.courseName;
      if (file.fieldname.split("-").pop() === "courseImage")
        dir = "./public/courses/" + username + "/" + courseName;
      else {
        const chapterName = file.fieldname.split("-")[0];
        dir =
          "./public/courses/" + username + "/" + courseName + "/" + chapterName;
      }

      if (!fs.existsSync(dir)) {
        shell.mkdir("-p", dir);
      }
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      fileName =
        file.fieldname.split("-").pop() +
        "." +
        file.originalname.split(".").pop();
      if (file.fieldname.split("-").pop() === "courseImage")
        imageExtension = file.originalname.split(".").pop();
      cb(null, fileName);
    },
  });
  const upload = multer({ storage });
  upload.any()(req, res, async function (err) {
    if (err) {
      console.log(err);
    } else {
      const course = {
        name: req.body.courseName,
        price: req.body.price,
        categoryId: req.body.categories,
        shortDes: req.body.shortDes,
        detailDes: req.body.detailDes,
        discountPrice: req.body.discount ? req.body.discount : null,
        totalView: 0,
        totalStudent: 0,
        updateDate: moment(new Date(), "YYYY-MM-DDThh:mm:ssZ").format(
          "YYYY-MM-DD hh:mm:ss"
        ),
        author: req.session.authUser.Username,
        statusId: 2,
        image: username + "/" + courseName + "/courseImage." + imageExtension,
        isFinish: req.body.isFinish ? req.body.isFinish : 0,
      };

      const { insertId } = await courseModel.add(course);
      insertCourseContent(req.body, insertId, username, courseName, fileName);
      res.redirect("./add");
    }
  });
});

router.get("/course/is-available", async function (req, res) {
  const courseName = req.query.courseName;
  const course = await courseModel.singleByName(courseName);
  if (course === null) {
    return res.json(true);
  }

  res.json(false);
});

function isTeacher(req, res, next) {
  if (req.session.authUser.RoleId != 3) {
    return res.redirect("../");
  }
  next();
}

async function insertCourseContent(
  fields,
  courseId,
  username,
  courseName,
  fileName
) {
  const chapterIds = {};
  for (let field in fields) {
    if (field.split("-").length > 1) {
      const splitedField = field.split("-");
      const fieldType = splitedField[0];
      const chapterId = splitedField[1];
      if (fieldType === "chapter") {
        const courseContent = {
          courseId: courseId,
          chapterName: fields[field],
        };
        const res = await courseContentModel.add(courseContent);
        chapterIds[chapterId] = {
          chapterId: res.insertId,
          chapterName: fields[field],
        };
      } else {
        const courseContentDetail = {
          name: fields[field],
          contentId: chapterIds[chapterId].chapterId,
          video:
            username +
            "/" +
            courseName +
            "/" +
            chapterIds[chapterId].chapterName +
            "/" +
            fields[field] +
            ".mp4",
        };
        await courseContentDetailModel.add(courseContentDetail);
      }
    }
  }
}

module.exports = router;
