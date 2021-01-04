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
const { async } = require("crypto-random-string");

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

  rows.forEach(async (course) => {
    const courseChapters = await courseContentModel.allByCourseId(course.Id);
    for (const chapter in courseChapters) {
      const lessons = await courseContentDetailModel.allByChapterId(
        courseChapters[chapter].Id
      );

      if (lessons.length === 0) {
        course.isFinish = false;
        break;
      } else {
        course.isFinish = true;
      }
    }
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
      };

      const { insertId } = await courseModel.add(course);
      insertCourseContent(req.body, insertId, username, courseName);
      res.redirect("./add");
    }
  });
});

router.get("/course/is-available", async function (req, res) {
  const courseName = req.query.courseName;
  const username = req.session.authUser.Username;
  const course = await courseModel.singleByName(courseName, username);
  if (course === null) {
    return res.json(true);
  }

  res.json(false);
});

router.get("/lesson/is-available", async function (req, res) {
  const chapterId = req.query.chapterId;
  const lessonName = req.query.lessonName;
  const lesson = await courseContentDetailModel.singleByNameInChapter(
    chapterId,
    lessonName
  );
  if (lesson === null) {
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

router.get("/edit/favicon.ico", (req, res, next) => {
  res.json("remove favicon when get");
});

router.get("/edit/:courseId/contents/favicon.ico", function (req, res) {
  res.json("remove favicon when get");
});

// router.post(
//   "/edit/:courseId/contents/:chapterId",
//   auth,
//   isTeacher,
//   async function (req, res) {
//     const chapterId = req.params.chapterId;
//     const courseId = req.params.courseId;
//     const username = req.session.authUser.Username;
//     const course = await courseModel.singleById(courseId);
//     const chapter = await courseContentModel.singleById(chapterId, courseId);

//     const dir =
//       "./public/courses/" +
//       username +
//       "/" +
//       course.Name +
//       "/" +
//       chapter.ChapterName;
//     const storage = multer.diskStorage({
//       destination: function (req, file, cb) {
//         cb(null, dir);
//       },
//       filename: async function (req, file, cb) {
//         fileName =
//           file.fieldname.split("-").pop() +
//           "." +
//           file.originalname.split(".").pop();
//         const lessonId = file.fieldname.split("-")[0];
//         const lesson = await courseContentDetailModel.singleById(lessonId);

//         lesson.Video = dir + "/" + fileName;
//         await courseContentDetailModel.patch(lesson);

//         cb(null, fileName);
//       },
//     });
//     const upload = multer({ storage });
//     upload.any()(req, res, async function (err) {
//       if (err) {
//         console.log(err);
//       } else {
//         chapter.ChapterName = req.body[chapterId];
//         const newDir =
//           "./public/courses/" +
//           username +
//           "/" +
//           course.Name +
//           "/" +
//           chapter.ChapterName;
//         fs.renameSync(dir, newDir, (err) => {
//           if (err) console.log(err);
//         });

//         let i = 0;
//         for (let lessonId in req.body) {
//           if (i++ === 0) continue;

//           const lesson = await courseContentDetailModel.singleById(lessonId);
//           lesson.Name = req.body[lessonId];
//           lesson.Video =
//             username +
//             "/" +
//             course.Name +
//             "/" +
//             chapter.ChapterName +
//             "/" +
//             lesson.Video.split("/").pop();
//           await courseContentDetailModel.patch(lesson);
//         }

//         await courseContentModel.patch(chapter);
//         res.redirect(`/teacher/edit/${courseId}/contents/${chapterId}`);
//       }
//     });
//   }
// );

router.get(
  "/edit/:courseId/contents/:chapterId",
  auth,
  isTeacher,

  async function (req, res) {
    const chapterId = req.params.chapterId;
    const courseId = req.params.courseId;

    const chapter = await courseContentModel.singleById(chapterId, courseId);
    chapter.lessons = await courseContentDetailModel.allByChapterId(chapterId);

    res.render("viewTeacher/courses-chapter", {
      chapter,
      courseId,
    });
  }
);

router.get(
  "/edit/:courseId/contents/:chapterId/upload/:lessonId",
  auth,
  isTeacher,
  async function (req, res) {
    const courseId = req.params.courseId;
    const chapterId = req.params.chapterId;
    const lessonId = req.params.lessonId;

    const chapter = await courseContentModel.singleById(chapterId, courseId);
    const lesson = await courseContentDetailModel.singleById(lessonId);

    res.render("viewTeacher/courses-upload-chapter", {
      chapter,
      lesson,
    });
  }
);

router.post(
  "/edit/:courseId/contents/:chapterId/upload/:lessonId",
  auth,
  isTeacher,
  async function (req, res) {
    const lessonId = req.params.lessonId;
    const courseId = req.params.courseId;
    const chapterId = req.params.chapterId;
    const lesson = await courseContentDetailModel.singleById(lessonId);
    const arrayPath = lesson.Video.split("/");
    const dir = arrayPath[0] + "/" + arrayPath[1] + "/" + arrayPath[2];

    let fileName = null;
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "./public/courses/" + dir);
      },
      filename: function (req, file, cb) {
        fileName = lesson.Name + "." + file.originalname.split(".").pop();
        cb(null, fileName);
      },
    });
    const upload = multer({ storage });
    upload.single("fuMain")(req, res, async function (err) {
      if (err) {
        console.log(err);
      } else {
        lesson.Video = dir + "/" + fileName;
        await courseContentDetailModel.patch(lesson);
        res.redirect("/teacher/edit/" + courseId + "/contents/" + chapterId);
      }
    });
  }
);

router.get(
  "/contents/is-available/",
  auth,
  isTeacher,
  async function (req, res) {
    const chapterId = req.query.chapterId;
    const chapterName = req.query.chapterName;
    const courseId = req.query.courseId;

    const chapter = await courseContentModel.checkIfChapterNameExist(
      courseId,
      chapterId,
      chapterName
    );

    if (chapter === null) {
      return res.json(true);
    }

    res.json(false);
  }
);

router.get(
  "/course/is-rename-available",
  auth,
  isTeacher,
  async function (req, res) {
    const courseName = req.query.courseName;
    const courseId = req.query.courseId;
    const username = req.session.authUser.Username;

    const course = await courseModel.checkIfCourseNameExist(
      courseId,
      courseName,
      username
    );

    if (course === null) {
      return res.json(true);
    }

    res.json(false);
  }
);

router.get("/edit/:courseId", auth, isTeacher, async function (req, res) {
  const course = await courseModel.singleById(req.params.courseId);
  const categories = res.locals.lcCategories;
  const subCate = [];
  for (let cate in categories) {
    categories[cate].SubCate.forEach((element) => {
      subCate.push(element);
    });
  }

  res.render("viewTeacher/courses-edit", {
    course,
    category: subCate,
  });
});
let fileName = null;
router.post("/edit/:courseId", auth, isTeacher, async function (req, res) {
  const courseId = req.params.courseId;
  const course = await courseModel.singleById(req.params.courseId);
  course.Image =
    course.Author + "/" + course.Name + "/" + course.Image.split("/").pop();

  course.CategoryId = req.body.categories;
  course.Price = req.body.price;
  course.DiscountPrice = req.body.discount === "" ? null : req.body.discount;
  course.ShortDes = req.body.shortDes;
  course.DetailDes = req.body.detailDes;

  const chapters = await courseContentModel.allByCourseId(course.Id);
  for (let chapter in chapters) {
    const chapterId = chapters[chapter].Id;
    const lessons = await courseContentDetailModel.allByChapterId(chapterId);

    for (let lesson in lessons) {
      const splitPath = lessons[lesson].Video.split("/");
      lessons[lesson].Video =
        splitPath[0] +
        "/" +
        course.Name +
        "/" +
        splitPath[2] +
        "/" +
        splitPath[3];
      await courseContentDetailModel.patch(lessons[lesson]);
    }
  }
  await courseModel.patch(course);

  res.redirect("/teacher/edit/" + courseId);
});

router.get("/:courseId/contents", auth, isTeacher, async function (req, res) {
  const courseId = req.params.courseId;
  const course = await courseModel.singleById(courseId);
  const courseChapters = await courseContentModel.allByCourseId(courseId);
  for (const chapter in courseChapters) {
    const numberlessons = await courseContentDetailModel.countAllByChapterId(
      courseChapters[chapter].Id
    );

    courseChapters[chapter].TotalLesson = numberlessons;
  }

  res.render("viewTeacher/courses-content", {
    course,
    courseChapters,
  });
});

router.get(
  "/:courseId/contents/upload",
  auth,
  isTeacher,
  async function (req, res) {
    const courseId = req.params.courseId;
    const course = await courseModel.singleById(courseId);

    res.render("viewTeacher/courses-upload-image", {
      course,
    });
  }
);

router.post(
  "/:courseId/contents/upload",
  auth,
  isTeacher,
  async function (req, res) {
    const courseId = req.params.courseId;
    const course = await courseModel.singleById(courseId);

    const dir = "./public/courses/" + course.Author + "/" + course.Name + "/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    let fileName = null;
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, dir);
      },
      filename: function (req, file, cb) {
        fileName = "courseImage." + file.originalname.split(".").pop();
        cb(null, fileName);
      },
    });
    const upload = multer({ storage });
    upload.single("fuMain")(req, res, async function (err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/teacher/edit/" + courseId);
      }
    });
    res.render("viewTeacher/courses-upload-image", {
      course,
    });
  }
);

router.post("/delete", auth, isTeacher, async function (req, res) {
  const id = req.body.Id;

  await courseModel.delete(id);
  res.redirect("/teacher");
});

router.post("/:courseId/delete", auth, isTeacher, async function (req, res) {
  const courseId = req.params.courseId;
  const chapterId = req.body.Id;

  const lessons = await courseContentDetailModel.allByChapterId(chapterId);

  for (lesson in lessons) {
    await courseContentDetailModel.delete(lessons[lesson].Id);
  }

  await courseContentModel.delete(chapterId);
  res.redirect("/teacher/" + courseId + "/contents");
});

router.get("/:courseId/contents/add", auth, isTeacher, async (req, res) => {
  const course = await courseModel.singleById(req.params.courseId);
  res.render("viewTeacher/courses-chapter-add", {
    course,
  });
});

router.get(
  "/edit/:courseId/contents/:chapterId/add",
  auth,
  isTeacher,
  async (req, res) => {
    res.render("viewTeacher/courses-lesson-add", {
      courseId: req.params.courseId,
      chapterId: req.params.chapterId,
    });
  }
);

router.post(
  "/edit/:courseId/contents/:chapterId/add",
  auth,
  isTeacher,
  async (req, res) => {
    const course = await courseModel.singleById(req.params.courseId);
    const chapter = await courseContentModel.singleById(
      req.params.chapterId,
      req.params.courseId
    );
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(
          null,
          "./public/courses/" +
            course.Author +
            "/" +
            course.Name +
            "/" +
            chapter.ChapterName
        );
      },
      filename: function (req, file, cb) {
        fileName = file.fieldname + "." + file.originalname.split(".").pop();
        cb(null, fileName);
      },
    });
    const upload = multer({ storage });
    upload.any()(req, res, async function (err) {
      if (err) {
        console.log(err);
      } else {
        const lesson = {
          contentId: chapter.Id,
          name: req.body.lessonName,
          Video:
            course.Author +
            "/" +
            course.Name +
            "/" +
            chapter.ChapterName +
            "/" +
            fileName,
        };
        await courseContentDetailModel.add(lesson);
        res.redirect("/teacher/edit/" + course.Id + "/contents/" + chapter.Id);
      }
    });
  }
);

router.post("/:courseId/contents/add", auth, isTeacher, async (req, res) => {
  const course = await courseModel.singleById(req.params.courseId);
  let dir = "./public/courses/" + course.Author + "/" + course.Name + "/";
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const path = dir + req.body.chapter;

      if (!fs.existsSync(path)) fs.mkdirSync(path);
      cb(null, path);
    },
    filename: function (req, file, cb) {
      fileName = file.fieldname + "." + file.originalname.split(".").pop();
      cb(null, fileName);
    },
  });
  const upload = multer({ storage });
  upload.any()(req, res, async function (err) {
    if (err) {
      console.log(err);
    } else {
      const chapter = {
        CourseId: course.Id,
        ChapterName: req.body.chapter,
      };
      const { insertId } = await courseContentModel.add(chapter);
      for (let field in req.body) {
        if (field === "chapter") continue;

        const lesson = {
          ContentId: insertId,
          Video:
            course.Author +
            "/" +
            course.Name +
            "/" +
            req.body.chapter +
            "/" +
            req.body[field] +
            ".mp4",
          Name: req.body[field],
        };

        await courseContentDetailModel.add(lesson);
      }
      res.redirect("/teacher");
    }
  });
});

async function insertCourseContent(fields, courseId, username, courseName) {
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
