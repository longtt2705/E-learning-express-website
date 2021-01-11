const categoryModel = require("../models/category.model");
const cartModel = require("../models/cart.model");
const courseModel = require("../models/course.model");
const orderModel = require("../models/order.model");

module.exports = (app) => {
  app.use(async function (req, res, next) {
    if (typeof req.session.isAuth === "undefined") {
      req.session.isAuth = false;
    }
    if (typeof req.session.cart === "undefined") req.session.cart = [];

    res.locals.isAuth = req.session.isAuth;
    res.locals.authUser = req.session.authUser;
    res.locals.cartSummary = cartModel.getNumberOfItems(req.session.cart);
    res.locals.mostViewCourses = await courseModel.getCoursesWithMostView();
    res.locals.newestCourses = await courseModel.getNewestCourses();
    res.locals.bestSellers = await courseModel.getCourseWithMostStudent();
    const courseIds = await courseModel.getTopCoursesWithMostBuyLastWeek();
    const outstandingCourses = [];
    for (const course of courseIds) {
      outstandingCourses.push(await courseModel.singleByIdWithInfo(course.Id));
    }
    res.locals.outstandingCourses = outstandingCourses;

    const cateIds = await categoryModel.getTopCategoriesWithMostBuyLastWeek();
    const outstandingCate = [];
    for (const cate of cateIds) {
      outstandingCate.push(await categoryModel.singlebyId(cate.Id));
    }
    res.locals.outstandingCate = outstandingCate;
    next();
  });

  app.use(async function (req, res, next) {
    const rows = await categoryModel.all();
    const categories = {};
    for (let i = rows.length - 1; i >= 0; i--) {
      if (rows[i].ManagementId === null) {
        categories[rows[i].Id] = { ...rows[i], SubCate: [] };
        delete rows[i];
      }
    }

    for (let row in rows) {
      const id = rows[row].ManagementId;

      for (let category in categories) {
        if (category == id) {
          categories[category].SubCate.push(rows[row]);
        }
      }
    }

    res.locals.lcCategories = categories;
    next();
  });
};
