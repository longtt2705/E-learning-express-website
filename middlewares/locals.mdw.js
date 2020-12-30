const categoryModel = require("../models/category.model");

module.exports = (app) => {
  app.use(async function (req, res, next) {
    if (typeof req.session.isAuth === "undefined") {
      req.session.isAuth = false;
    }

    res.locals.isAuth = req.session.isAuth;
    res.locals.authUser = req.session.authUser;
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
