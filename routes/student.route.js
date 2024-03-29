const { async } = require("crypto-random-string");
const express = require("express");
const { route } = require("./course.route");
const auth = require("../middlewares/auth.mdw");
const courseModel = require("../models/course.model");
const cartModel = require("../models/cart.model");
const orderModel = require("../models/order.model");
const orderDetailModel = require("../models/order-detail.model");
const moment = require("moment");
const courseContentModel = require("../models/course-content.model");
const courseContentDetailModel = require("../models/course-content-detail.model");
const courseProgressModel = require("../models/course-progress.model");
const courseProgressDetailModel = require("../models/course-progress-detail.model");
const accountModel = require("../models/account.model");
const ratingModel = require("../models/rating.model");
const wishlistsModel = require("../models/wishlist.model");
const config = require("../config/default.json");
const router = express.Router();

router.get("/course/favicon.ico", (req, res) => {
  res.json({});
});

router.get("/course/:courseId", auth, isStudent, async (req, res) => {
  const username = req.session.authUser.Username;
  const course = await courseModel.singleByIdWithInfo(req.params.courseId);
  course.chapters = await courseContentModel.allByCourseId(course.Id);
  let playing = req.query.playing;
  let currentTime = 0;

  const progress = await courseProgressModel.singleByUsernameAndCourse(
    username,
    course.Id
  );

  let lessonIndex = 1;
  let playingVideo = null;
  for (const chapter of course.chapters) {
    chapter.lessons = [];
    const lessons = await courseContentDetailModel.allByChapterId(chapter.Id);
    for (const lesson of lessons) {
      const lessonDetail = {
        index: lessonIndex,
        lesson: lesson,
        isActive: false,
      };
      if (progress !== null) {
        const progressDetail = await courseProgressDetailModel.singleByProgressIdAndLesson(
          lesson.Id,
          progress.Id
        );

        if (progressDetail !== null) {
          lessonDetail.IsFinish =
            progressDetail.IsFinish == "1" ? progressDetail.IsFinish : null;
          lessonDetail.currentTime = progressDetail
            ? progressDetail.Progress
            : 0;
          lessonDetail.duration = progressDetail ? progressDetail.Duration : 0;
        }

        if (playing !== undefined) {
          if (lessonIndex == playing) {
            playingVideo = lesson;
            lessonDetail.isActive = true;

            currentTime = progressDetail ? progressDetail.Progress : 0;
          }
        } else if (progress.CurrentLesson === lesson.Id) {
          playingVideo = lesson;
          lessonDetail.isActive = true;

          currentTime = progressDetail ? progressDetail.Progress : 0;
        }
      }
      lessonIndex++;
      chapter.lessons.push(lessonDetail);
    }
  }

  const account = await accountModel.singleByUserNameWithoutProvider(
    course.Author
  );
  const isEmpty = lessonIndex === 1;
  if (playingVideo === null && !isEmpty) {
    playingVideo = course.chapters[0].lessons[0].lesson;
    course.chapters[0].lessons[0].isActive = true;
  }

  res.render("viewStudent/lessons", {
    isEmpty,
    course,
    account,
    playingVideo,
    currentTime,
  });
});

router.post("/course-progress/update", auth, isStudent, async (req, res) => {
  const username = req.session.authUser.Username;
  const { lessonId, currentTime, fullTime, courseId } = req.body;
  const progress = await courseProgressModel.singleByUsernameAndCourse(
    username,
    courseId
  );
  progress.CurrentLesson = lessonId;
  await courseProgressModel.patch(progress);
  const progressDetail = await courseProgressDetailModel.singleByProgressIdAndLesson(
    lessonId,
    progress.Id
  );
  if (progressDetail === null) {
    if (+currentTime > 0)
      await courseProgressDetailModel.add({
        progressId: progress.Id,
        statusId: 1,
        progress: currentTime,
        lessonId: lessonId,
        duration: fullTime,
        IsFinish: Math.abs(currentTime - fullTime) <= 0.1 * fullTime,
      });
  } else {
    progressDetail.Progress = currentTime;
    progressDetail.IsFinish =
      progressDetail.IsFinish == "1"
        ? progressDetail.IsFinish
        : Math.abs(currentTime - fullTime) <= 0.1 * fullTime;

    await courseProgressDetailModel.patch(progressDetail);
  }
  res.json("OK");
});

router.post("/rate/:courseId", auth, isStudent, async (req, res) => {
  const rate = await ratingModel.singleByUsernameAndCourse(
    req.params.courseId,
    req.session.authUser.Username
  );
  if (rate !== null) {
    rate.Comment = req.body.comment;
    rate.Rate = req.body.rating;
    rate.Date = moment().format("YYYY-MM-DD HH:mm:ss");
    await ratingModel.patch(rate);
    return res.redirect(req.headers.referer);
  }
  const rating = {
    courseId: req.params.courseId,
    Username: req.session.authUser.Username,
    Rate: req.body.rating,
    Comment: req.body.comment,
    statusId: 1,
    Date: moment().format("YYYY-MM-DD HH:mm:ss"),
  };

  await ratingModel.add(rating);
  res.redirect(req.headers.referer);
});
router.get("/wishlist", auth, isStudent, async (req, res) => {
  const username = req.session.authUser.Username;
  const coursesIDs = await wishlistsModel.idAllCourseByName(username);
  const rows = [];
  for (const courseId of coursesIDs) {
    const result = await courseModel.singleById(courseId.Courseid);
    rows.push(result);
  }

  res.render("viewStudent/wishlist", {
    rows,
    empty: rows.length === 0,
  });
});
router.get("/wishlist/add/:courseId", auth, isStudent, async (req, res) => {
  const username = req.session.authUser.Username;
  const courseid = req.params.courseId;
  const row = { Username: username, CourseId: courseid };
  const result = await wishlistsModel.singleByCourseIdAndUsername(
    courseid,
    username
  );
  if (result === null) await wishlistsModel.add(row);
  res.redirect("/course/" + courseid);
});
router.get("/wishlist/delete/:courseId", auth, isStudent, async (req, res) => {
  const courseid = req.params.courseId;
  const id = await wishlistsModel.singleByCourseIdAndUsername(
    courseid,
    req.session.authUser.Username
  );

  await wishlistsModel.delete(id);
  res.redirect("/course/" + courseid);
});
router.post("/wishlist/delete", auth, isStudent, async (req, res) => {
  const id = await wishlistsModel.singleByCourseIdAndUsername(
    req.body.Id,
    req.session.authUser.Username
  );

  await wishlistsModel.delete(id);
  res.redirect("/student/wishlist");
});
router.get("/course", async (req, res) => {
  res.render("viewStudent/lessons");
});
router.get("/cart", auth, isStudent, async (req, res) => {
  const items = [];
  let totalPrice = 0;
  for (const item of req.session.cart) {
    const course = await courseModel.singleByIdWithInfo(item.id);
    totalPrice += course.DiscountPrice ? +course.DiscountPrice : +course.Price;
    items.push(course);
  }
  res.render("viewStudent/cart", {
    items,
    empty: req.session.cart.length === 0,
    totalPrice,
  });
});

router.get("/my-learning", auth, isStudent, async (req, res) => {
  const username = req.session.authUser.Username;

  let page = req.query.page || 1;
  const total = await orderModel.countCoursesBoughtByUsername(username);
  const totalPage = Math.ceil(total / config.pagination.limit);

  if (page < 1) page = 1;
  if (totalPage > 0 && page > totalPage) page = totalPage;

  const offset = (page - 1) * config.pagination.limit;

  const page_items = [];

  for (let i = 1; i <= totalPage; i++) {
    const page_item = {
      value: i,
      isActive: page == i,
    };

    page_items.push(page_item);
  }
  const courseIds = await orderModel.getCoursesBoughtByUsernameByPage(
    username,
    offset
  );
  const courseList = [];
  for (const courseId of courseIds) {
    const course = await courseModel.singleByIdWithInfo(courseId.id);
    const progress = await courseProgressModel.singleByUsernameAndCourse(
      username,
      course.Id
    );
    if (progress === null) {
      courseList.push({
        ...course,
        progress: 0,
      });
      continue;
    }
    const allLessons = await courseContentDetailModel.countAllByCourseId(
      course.Id
    );
    const learnedLessons = await courseProgressDetailModel.countLessonFinishedByProgressId(
      progress.Id
    );

    courseList.push({
      ...course,
      progress: (learnedLessons / allLessons) * 100,
    });
  }
  res.render("viewStudent/my-learning", {
    items: courseList,
    page_items,
    canGoPrev: page > 1,
    canGoNext: page < totalPage,
    nextPage: +page + 1,
    prevPage: page - 1,
  });
});

router.post("/cart/add", auth, isStudent, function (req, res) {
  const item = {
    id: req.body.id,
  };

  cartModel.add(req.session.cart, item);
  res.redirect(req.headers.referer);
});

router.post("/cart/remove", auth, isStudent, function (req, res) {
  cartModel.del(req.session.cart, req.body.id);
  res.redirect(req.headers.referer);
});

router.post("/cart/checkout", auth, isStudent, async function (req, res) {
  const details = [];
  let totalCost = 0;
  for (const item of req.session.cart) {
    const course = await courseModel.singleById(item.id);
    const cost = course.DiscountPrice ? +course.DiscountPrice : +course.Price;
    course.TotalStudent = +course.TotalStudent + 1;
    await courseModel.patch(course);
    totalCost += cost;
    details.push({
      courseId: course.Id,
      Cost: cost,
    });
    await courseProgressModel.add({
      CourseId: course.Id,
      Username: req.session.authUser.Username,
      currentLesson: 1,
    });
  }

  const order = {
    DateCreate: moment().format("YYYY-MM-DD HH:mm:ss"),
    Username: req.session.authUser.Username,
    totalCost: totalCost,
    statusid: 1,
  };
  const { insertId } = await orderModel.add(order);

  for (const detail of details) {
    detail.OrderId = insertId;
    await orderDetailModel.add(detail);
  }

  req.session.cart = [];
  res.redirect(req.headers.referer);
});

function isStudent(req, res, next) {
  if (req.session.authUser.RoleId != 2) {
    return res.redirect("/");
  }
  next();
}

module.exports = router;
