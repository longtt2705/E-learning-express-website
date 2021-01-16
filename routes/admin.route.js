const express = require("express");
const auth = require("../middlewares/auth.mdw");
const bcrypt = require("bcryptjs");
const encryptTimes = 10;
const accountModel = require("../models/account.model");
const categoryModel = require("../models/category.model");
const config = require("../config/default.json");
const multer = require("multer");
const fs = require("fs");
const courseModel = require("../models/course.model");
const orderModel = require("../models/order.model");
const courseContentModel = require("../models/course-content.model");
const courseContentDetailModel = require("../models/course-content-detail.model");
const { async } = require("crypto-random-string");
const { CLIENT_RENEG_LIMIT } = require("tls");

const router = express.Router();

router.get("/", auth, isAdmin, async function (req, res) {
  const active = getActive("dashboard");
  const rowTeacher=await accountModel.countTeacher();
  const rowStudent= await accountModel.countStudent();
  const rowTotalCost=await orderModel.getTotalOrder();
  const rowHistoryStudent = await orderModel.getHistoryOrder();
  const rowTopSale = await orderModel.getTopCourseOrder();
  const rowTopSaleName = [];
  const rowTopSaleTotal = [];
  const rowHistoryTeacher = await courseModel.getHistoryUpCourses();
  
  for (let i = 0; i < rowTopSale.length; i++) {
    rowTopSaleName.push(rowTopSale[i].Name)
    rowTopSaleTotal.push(rowTopSale[i].total)
  }
  
  res.render("viewAdmin/dashboard", {
    layout: "admin.hbs",
    totalTeacher:rowTeacher,
    totalStudent:rowStudent,
    TotalOrder:rowTotalCost,
    HistoryOrder:rowHistoryStudent,
    TopSaleName:rowTopSaleName,
    TopSaleTotal:rowTopSaleTotal,
    HistoryUpCourses:rowHistoryTeacher,
    active,
  });
});

router.get("/account", auth, isAdmin, async function (req, res) {
  const active = getActive("account");
  let page = req.query.page || 1;
  const total = await accountModel.countAllWithoutAdmin();

  const totalPage = Math.ceil(total / config.pagination.limit);

  if (page < 1) page = 1;
  if (totalPage > 0 && page > totalPage) page = totalPage;

  const offset = (page - 1) * config.pagination.limit;
  const rows = await accountModel.allWithoutAdminByPage(offset);

  const page_items = [];

  for (let i = 1; i <= totalPage; i++) {
    const page_item = {
      value: i,
      isActive: page == i,
    };

    page_items.push(page_item);
  }

  if (rows !== null) {
    rows.forEach((e) => {
      e.isVerified = e.StatusId == 4;
      e.isBlocked = e.StatusId == 6;
    });
  }

  res.render("viewAdmin/account/account", {
    layout: "admin.hbs",
    active,
    items: rows,
    isEmpty: rows.length === 0,
    page_items,
    canGoPrev: page > 1,
    canGoNext: page < totalPage,
    nextPage: +page + 1,
    prevPage: page - 1,
  });
});

router.get("/account/search", auth, isAdmin, async (req, res) => {
  const searchType = req.query.search;
  const sort = req.query.sort;
  const order = req.query.order;
  const content = req.query.searchContent;
  const role = req.query.role;
  const active = getActive("account");
  let rows, total;
  if (searchType === "username")
    total = await accountModel.countAllWithLike(searchType, content, role);
  else
    total = await accountModel.countAllWithFullText(searchType, content, role);
  const totalPage = Math.ceil(total / config.pagination.limit);

  let page = req.query.page || 1;
  if (page < 1) page = 1;
  if (totalPage > 0 && page > totalPage) page = totalPage;
  const offset = (page - 1) * config.pagination.limit;
  if (searchType === "username") {
    rows = await accountModel.searchWithLikeByPage(
      searchType,
      sort,
      order,
      content,
      offset,
      role
    );
  } else {
    rows = await accountModel.searchWithFullTextByPage(
      searchType,
      sort,
      order,
      content,
      offset,
      role
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

  if (rows !== null) {
    rows.forEach((e) => {
      e.isVerified = e.StatusId == 4;
      e.isBlocked = e.StatusId == 6;
    });
  }

  res.render("viewAdmin/account/account", {
    layout: "admin.hbs",
    active,
    items: rows,
    isEmpty: rows.length === 0,
    page_items,
    canGoPrev: page > 1,
    canGoNext: page < totalPage,
    nextPage: +page + 1,
    prevPage: page - 1,
  });
});

router.post("/course/delete", auth, isAdmin, async (req, res) => {
  const id = req.body.Id;
  const chapters = await courseContentModel.allByCourseId(id);
  for (let chapter in chapters) {
    const lessons = await courseContentDetailModel.allByChapterId(
      chapters[chapter].Id
    );
    for (let lesson in lessons) {
      await courseContentDetailModel.delete(lessons[lesson].Id);
    }

    await courseContentModel.delete(chapters[chapter].Id);
  }

  await courseModel.delete(id);

  res.redirect("/admin/course");
});

router.post("/course/suspend", auth, isAdmin, async (req, res) => {
  const id = req.body.Id;
  const course = await courseModel.singleById(id);
  if (course.StatusId == 7) course.StatusId = 2;
  else course.StatusId = 7;
  await courseModel.patch(course);

  res.redirect("/admin/course");
});

router.get("/account/add", auth, isAdmin, async function (req, res) {
  const active = getActive("account");
  res.render("viewAdmin/account/account-add", {
    layout: "admin.hbs",
    active,
  });
});

router.post("/account/add", auth, isAdmin, async function (req, res) {
  const hash = bcrypt.hashSync(req.body.password, encryptTimes);
  const account = {
    username: req.body.email,
    password: hash,
    phone: req.body.phone,
    balance: 0.0,
    name: req.body.name,
    image: "avatar.jpg",
    statusid: 4,
    roleid: req.body.roleid,
  };

  await accountModel.add(account);
  res.redirect("../account/add");
});

router.get("/account/edit/:username", auth, isAdmin, async function (req, res) {
  const active = getActive("account");
  let account = await accountModel.singleByUserNameWithoutProvider(
    req.params.username
  );
  account.isStudent = account.RoleId === 2;
  res.render("viewAdmin/account/account-edit", {
    layout: "admin.hbs",
    active,
    account,
  });
});

router.get(
  "/account/edit/upload/:username",
  auth,
  isAdmin,
  async function (req, res) {
    const active = getActive("account");
    let account = await accountModel.singleByUserNameWithoutProvider(
      req.params.username
    );
    account.isStudent = account.RoleId === 2;
    res.render("viewAdmin/account/account-edit-avatar", {
      layout: "admin.hbs",
      active,
      account,
    });
  }
);

router.post(
  "/account/edit/upload/:username",
  auth,
  isAdmin,
  async (req, res) => {
    const username = req.params.username;
    const dir = "./public/img/account/" + username;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    let fileName = null;
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, dir);
      },
      filename: function (req, file, cb) {
        cb(null, file.originalname);
        fileName = file.originalname;
      },
    });
    const upload = multer({ storage });
    upload.single("fuMain")(req, res, async function (err) {
      if (err) {
        console.log(err);
      } else {
        let user = await accountModel.singleByUserNameWithoutProvider(username);
        user.Image = "account/" + username + "/" + fileName;
        await accountModel.patch(user);
        res.redirect("../" + username);
      }
    });
  }
);

router.post("/account/edit/:user", auth, isAdmin, async function (req, res) {
  const account = await accountModel.singleByUserNameWithoutProvider(
    req.body.email
  );
  account.Phone = req.body.phone;
  account.Name = req.body.name;
  account.Description = req.body.FullDes;
  account.RoleId = req.body.roleid;

  await accountModel.patch(account);
  res.redirect("../");
});

router.post("/account/delete", auth, isAdmin, async function (req, res) {
  const username = req.body.username;

  await accountModel.delete(username);
  res.redirect("../account");
});

router.post("/account/block", auth, isAdmin, async function (req, res) {
  const username = req.body.username;
  const account = await accountModel.singleByUserNameWithoutProvider(username);
  if (account.StatusId == 6) account.StatusId = 4;
  else account.StatusId = 6;
  await accountModel.patch(account);
  res.redirect("../account");
});

router.get("/course", auth, isAdmin, async function (req, res) {
  const active = getActive("course");
  let page = req.query.page || 1;
  const total = await courseModel.countAll(true);

  const totalPage = Math.ceil(total / config.pagination.limit);
  if (page > totalPage) page = totalPage;
  if (page < 1) page = 1;
  const offset = (page - 1) * config.pagination.limit;
  const rows = await courseModel.allByPage(offset, true);

  const page_items = [];

  for (let i = 1; i <= totalPage; i++) {
    const page_item = {
      value: i,
      isActive: page == i,
    };

    page_items.push(page_item);
  }

  for (const course of rows) {
    course.isApprove = course.StatusId == 2;
    course.isSuspend = course.StatusId == 7;

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
  }

  const categories = res.locals.lcCategories;
  const subCate = [];
  for (let cate in categories) {
    categories[cate].SubCate.forEach((element) => {
      subCate.push(element);
    });
  }

  res.render("viewAdmin/courses/courses", {
    layout: "admin.hbs",
    active,
    items: rows,
    isEmpty: rows.length === 0,
    page_items,
    canGoPrev: page > 1,
    canGoNext: page < totalPage,
    nextPage: +page + 1,
    prevPage: page - 1,
    categories: subCate,
  });
});

router.get("/course/search", auth, isAdmin, async (req, res) => {
  const searchType = req.query.search;
  const sort = req.query.sort;
  const order = req.query.order;
  const content = req.query.searchContent;
  const category = req.query.category;
  const active = getActive("course");
  let rows, total;
  if (searchType === "c.author")
    total = await courseModel.countAllWithLike(
      searchType,
      content,
      true,
      category
    );
  else
    total = await courseModel.countAllWithFullText(
      searchType,
      content,
      true,
      category
    );
  const totalPage = Math.ceil(total / config.pagination.limit);

  let page = req.query.page || 1;
  if (page < 1) page = 1;
  if (totalPage > 0 && page > totalPage) page = totalPage;
  const offset = (page - 1) * config.pagination.limit;
  if (searchType === "c.author") {
    rows = await courseModel.searchWithLikeByPage(
      searchType,
      sort,
      order,
      content,
      offset,
      true,
      category
    );
  } else {
    rows = await courseModel.searchWithFullTextByPage(
      searchType,
      sort,
      order,
      content,
      offset,
      true,
      category
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

  if (rows != null) {
    for (const course of rows) {
      course.isApprove = course.StatusId == 2;
      course.isSuspend = course.StatusId == 7;
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
    }
  }

  const categories = res.locals.lcCategories;
  const subCate = [];
  for (let cate in categories) {
    categories[cate].SubCate.forEach((element) => {
      subCate.push(element);
    });
  }

  res.render("viewAdmin/courses/courses", {
    layout: "admin.hbs",
    active,
    items: rows,
    isEmpty: rows.length === 0,
    page_items,
    canGoPrev: page > 1,
    canGoNext: page < totalPage,
    nextPage: +page + 1,
    prevPage: page - 1,
    categories: subCate,
  });
});

router.get("/category", auth, isAdmin, async (req, res) => {
  const active = getActive("category");
  const categories = [];

  for (const category of Object.values(res.locals.lcCategories)) {
    categories.push({
      ...category,
      img: category.Image != null,
      notHasChild: category.SubCate.length <= 0,
    });
    for (const item of category.SubCate) {
      item.img = item.Image != null;
      const count = await categoryModel.countCourseById(item.Id);
      item.courses = count.SL === 0;
    }
  }

  res.render("viewAdmin/category/category", {
    categories,
    active,
    layout: "admin",
  });
});

router.get("/category/edit/is-available", async function (req, res) {
  const nameCategory = req.query.namecate;
  const category = await categoryModel.singleByName(nameCategory);
  if (category === null) {
    return res.json(true);
  }

  res.json(false);
});

router.get(
  "/category/edit/:categoryId",
  auth,
  isAdmin,
  async function (req, res) {
    const active = getActive("category");
    const category = await categoryModel.singlebyId(req.params.categoryId);
    category.img = category.Image !== null;
    res.render("viewAdmin/category/category-edit", {
      category,
      active,
      layout: "admin",
    });
  }
);

router.get(
  "/category/edit/upload/:categoryId",
  auth,
  isAdmin,
  async (req, res) => {
    const active = getActive("category");
    const categories = res.locals.lcCategories;

    const category = await categoryModel.singlebyId(req.params.categoryId);
    res.render("viewAdmin/category/category-edit-avatar", {
      category,
      active,
      layout: "admin",
    });
  }
);

router.post(
  "/category/edit/upload/:categoryId",
  auth,
  isAdmin,
  async (req, res) => {
    const category = await categoryModel.singlebyId(req.params.categoryId);
    const categoryId = req.params.categoryId;
    const dir = "./public/img/categories/" + categoryId;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    let fileName = null;
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, dir);
      },
      filename: function (req, file, cb) {
        cb(null, file.originalname);
        fileName = file.originalname;
      },
    });

    const upload = multer({ storage });
    upload.single("fuMain")(req, res, async function (err) {
      if (err) {
        console.log(err);
      } else {
        let cate = await categoryModel.singlebyId(categoryId);
        cate.Image = fileName;
        await categoryModel.patch(cate);
        res.redirect("../" + categoryId);
      }
    });
  }
);

router.post("/category/edit/:categoryId", auth, isAdmin, async (req, res) => {
  const category = await categoryModel.singlebyId(req.params.categoryId);
  category.Name = req.body.name;

  await categoryModel.patch(category);
  res.redirect("../");
});

router.post("/category/delete", auth, isAdmin, async (req, res) => {
  const category = await categoryModel.countByCategory(req.body.Id);
  if (category) {
    await categoryModel.delete(category.Id);
  }

  res.redirect("/admin/category");
});

router.get("/category/add", auth, isAdmin, async (req, res) => {
  const active = getActive("category");
  res.render("viewAdmin/category/category-add", {
    layout: "admin.hbs",
    active,
  });
});

router.get("/category/is-available", async function (req, res) {
  const nameCategory = req.query.namecate;
  const category = await categoryModel.singleByName(nameCategory);
  if (category === null) {
    return res.json(true);
  }

  res.json(false);
});

router.post("/category/add", auth, isAdmin, async (req, res) => {
  const nameCategory = {
    Name: req.body.nameCategory,
  };
  await categoryModel.add(nameCategory);
  res.redirect("../category/add");
});

router.get("/category/:categoryId/additem", auth, isAdmin, async (req, res) => {
  const active = getActive("category");
  res.render("viewAdmin/category/category-additem", {
    layout: "admin.hbs",
    categoryId: req.params.categoryId,
    active,
  });
});

router.get(
  "/category/:categoryId/is-available",
  auth,
  isAdmin,
  async function (req, res) {
    const nameCategoryItem = req.query.namecateitem;
    const categoryItem = await categoryModel.singleByName(nameCategoryItem);
    if (categoryItem === null) {
      return res.json(true);
    }

    res.json(false);
  }
);

router.post(
  "/category/:categoryId/additem",
  auth,
  isAdmin,
  async (req, res) => {
    const nameCategoryItem = {
      Name: req.body.nameCategoryItem,
      ManagementId: req.body.categoryId,
    };
    await categoryModel.add(nameCategoryItem);
    res.redirect("/admin/category");
  }
);

router.get(
  "/category/:ManagementId/is-available",
  auth,
  isAdmin,
  async function (req, res) {
    const nameCategoryItem = req.query.namecateitem;
    const categoryItem = await categoryModel.singleByName(nameCategoryItem);
    if (categoryItem === null) {
      return res.json(true);
    }

    res.json(false);
  }
);

router.get(
  "/category/:ManagementId/edit/:categoryId",
  auth,
  isAdmin,
  async (req, res) => {
    const active = getActive("category");

    const category = await categoryModel.singlebyId(req.params.categoryId);
    category.img = category.Image !== null;
    res.render("viewAdmin/category/category_item_edit", {
      category,
      active,
      layout: "admin",
    });
  }
);

router.get(
  "/category/:ManagementId/edit/upload/:categoryId",
  auth,
  isAdmin,
  async (req, res) => {
    const active = getActive("category");

    const category = await categoryModel.singlebyId(req.params.categoryId);
    res.render("viewAdmin/category/category_item_edit_avatar", {
      category,
      active,
      layout: "admin",
    });
  }
);

router.post(
  "/category/:ManagementId/edit/upload/:categoryId",
  auth,
  isAdmin,
  async (req, res) => {
    const category = await categoryModel.singlebyId(req.params.categoryId);

    const categoryId = req.params.categoryId;
    const dir = "./public/img/categories/" + categoryId;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    let fileName = null;
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, dir);
      },
      filename: function (req, file, cb) {
        cb(null, file.originalname);
        fileName = file.originalname;
      },
    });
    console.log(fileName);
    const upload = multer({ storage });
    upload.single("fuMain")(req, res, async function (err) {
      if (err) {
        console.log(err);
      } else {
        let cateitem = await categoryModel.singlebyId(categoryId);
        cateitem.Image = fileName;
        await categoryModel.patch(cateitem);
        res.redirect("../" + categoryId);
      }
    });
  }
);

router.post(
  "/category/:ManagementId/edit/:categoryId",
  auth,
  isAdmin,
  async (req, res) => {
    const category = await categoryModel.singlebyId(req.params.categoryId);
    category.Name = req.body.nameCategoryItem;
    await categoryModel.patch(category);
    res.redirect("../../");
  }
);

router.post(
  "/category/:ManagementId/delete",
  auth,
  isAdmin,
  async (req, res) => {
    const category = await categoryModel.countCourseById(req.body.Id);
    if (category == 0) {
      await categoryModel.delete(category.Id);
    }

    res.redirect("/admin/category");
  }
);

const getActive = (name) => {
  let active = {
    coursesWrapper: false,
    dashboardWrapper: false,
    course: false,
    account: false,
    category: false,
  };

  active[name] = true;
  if (name === "add" || name === "edit" || name === "detail")
    active.coursesWrapper = true;
  if (name === "course" || name === "account" || name === "category")
    active.dashboardWrapper = true;
  return active;
};

function isAdmin(req, res, next) {
  if (req.session.authUser.RoleId != 1) {
    return res.redirect("../");
  }

  next();
}

module.exports = router;
