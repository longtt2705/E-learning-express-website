const express = require("express");
const router = express.Router();
const courseModel = require("../models/course.model");
const courseContentModel = require("../models/course-content.model");
const courseContentDetailModel = require("../models/course-content-detail.model");
const config = require("../config/default.json");
const ratingModel = require("../models/rating.model");
const accountModel = require("../models/account.model");
const wishlistsModel = require("../models/wishlist.model");
const { async } = require("crypto-random-string");
const cartModel = require("../models/cart.model");
const orderModel = require("../models/order.model");

router.get("/", async (req, res) => {
  let page = req.query.page || 1;
  const total = await courseModel.countAll();

  const totalPage = Math.ceil(total / config.pagination.limit);
  if (page > totalPage) page = totalPage;
  if (page < 1) page = 1;
  const offset = (page - 1) * config.pagination.limit;
  const rows = await courseModel.allByPage(offset);

  const page_items = [];

  for (let i = 1; i <= totalPage; i++) {
    const page_item = {
      value: i,
      isActive: page == i,
    };

    page_items.push(page_item);
  }

  rows.forEach(async (course) => {
    course.AverageRate = course.AverageRate ? course.AverageRate : 0;
  });
  res.render("viewCourse/courses", {
    courses: rows,
    isEmpty: rows.length === 0,
    page_items,
    canGoPrev: page > 1,
    canGoNext: page < totalPage,
    nextPage: +page + 1,
    prevPage: page - 1,
  });
});

router.get("/search", async (req, res) => {
  const searchType = req.query.search;
  const sort = req.query.sort;
  const order = req.query.order;
  const content = req.query.searchContent;
  const fullText = req.query.fullText;
  let rows, total;

  if (fullText)
    total = await courseModel.countAllWithFullText(searchType, content);
  else total = await courseModel.countAllWithLike(searchType, content);
  const totalPage = Math.ceil(total / config.pagination.limit);

  let page = req.query.page || 1;
  if (page < 1) page = 1;
  if (totalPage > 0 && page > totalPage) page = totalPage;
  const offset = (page - 1) * config.pagination.limit;

  if (fullText) {
    rows = await courseModel.searchWithFullTextByPage(
      searchType,
      sort,
      order,
      content,
      offset
    );
  } else {
    rows = await courseModel.searchWithLikeByPage(
      searchType,
      sort,
      order,
      content,
      offset
    );
  }
  const page_items = [];
  for (let i = 1; i <= totalPage; i++) {
    const page_item = {
      value: i,
      isActive: page == i,
    };

    page_items.push(page_item);
  }

  rows.forEach(async (course) => {
    course.AverageRate = course.AverageRate ? course.AverageRate : 0;
  });
  res.render("viewCourse/courses", {
    courses: rows,
    isEmpty: rows.length === 0,
    page_items,
    canGoPrev: page > 1,
    canGoNext: page < totalPage,
    nextPage: +page + 1,
    prevPage: page - 1,
  });
});

router.get("/favicon.ico", (req, res) => {
  res.json("OK");
});

router.get("/:courseId", async (req, res) => {
  const courseId = req.params.courseId;
  const username = req.session.authUser ? req.session.authUser.Username : null;
  const course = await courseModel.singleByIdWithInfo(courseId);
  course.AverageRate = course.AverageRate ? course.AverageRate : 0;
  const stars = {};
  const starsIndex = ["zero", "one", "two", "three", "four", "five"];
  for (let i = 0; i <= 5; i++) {
    if (course.TotalRate > 0) {
      const result = await ratingModel.countRatingByStars(courseId, i);
      stars[starsIndex[i]] = Math.round((result / course.TotalRate) * 100);
    } else {
      stars[starsIndex[i]] = 0;
    }
  }

  const account = await accountModel.singleByUserNameWithoutProvider(
    course.Author
  );
  const chapters = await courseContentModel.allByCourseId(courseId);
  for (let chapter in chapters) {
    chapters[chapter].lessons = await courseContentDetailModel.allByChapterId(
      chapters[chapter].Id
    );
  }

  let ifBought = null;
  if (req.session.authUser && req.session.authUser.RoleId === 2) {
    ifBought = await orderModel.getCourseBoughtByUsername(course.Id, username);
    ifBought = ifBought ? ifBought.length === 1 : false;
  }

  const ratings = await ratingModel.allByCourseIdWithInfo(courseId);
  const wishlist = await wishlistsModel.singleByCourseIdAndUsername(
    courseId,
    username
  );

  let hasRated = false;
  for (let i = 0; i < ratings.length; i++) {
    if (ratings[i].Username === username) {
      hasRated = true;
      [ratings[0], ratings[i]] = [ratings[i], ratings[0]];
      break;
    }
  }

  await courseModel.patch({
    Id: course.Id,
    name: course.Name,
    price: course.Price,
    CategoryId: course.CategoryId,
    ShortDes: course.ShortDes,
    Image: course.Image,
    StatusId: course.StatusId,
    UpdateDate: course.UpdateDate,
    TotalView: +course.TotalView + 1,
    TotalStudent: course.TotalStudent,
    Author: course.Author,
    DiscountPrice: course.DiscountPrice,
    DetailDes: course.DetailDes,
  });

  const topCourses = await courseModel.topCourseInSameCategory(
    course.Id,
    course.CategoryId
  );
  res.render("viewCourse/detail", {
    course,
    stars,
    chapters,
    ratings,
    account,
    wishlist,
    InCart: cartModel.ifInCart(req.session.cart, { id: course.Id }),
    IfBought: ifBought,
    hasRated,
    TopCourses: topCourses,
  });
});

module.exports = router;
