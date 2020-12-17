const express = require("express");

const router = express.Router();

const datetime = new Date();

router.get("/dashboard", async function (req, res) {
  const active = getActive("dashboard");
  res.render("viewAdmin/dashboard", {
    layout: "admin.hbs",
    active,
  });
});

router.get("/course", async function (req, res) {
  const active = getActive("course");
  res.render("viewAdmin/pages/courses", {
    layout: "admin.hbs",
    active,
  });
});

router.get("/course/add", async function (req, res) {
  const active = getActive("add");
  res.render("viewAdmin/pages/course-add", {
    layout: "admin.hbs",
    active,
  });
});

router.get("/course/edit", async function (req, res) {
  const active = getActive("edit");
  res.render("viewAdmin/pages/course-edit", {
    layout: "admin.hbs",
    active,
  });
});

router.get("/course/detail", async function (req, res) {
  const active = getActive("detail");
  res.render("viewAdmin/pages/course-detail", {
    layout: "admin.hbs",
    active,
  });
});

const getActive = (name) => {
  let active = {
    coursesWrapper: false,
    add: false,
    edit: false,
    detail: false,
    dashboardWrapper: false,
    course: false,
    account: false,
    timeline: false,
  };

  active[name] = true;
  if (name === "add" || name === "edit" || name === "detail")
    active.coursesWrapper = true;
  if (name === "course" || name === "account" || name === "timeline")
    active.dashboardWrapper = true;
  return active;
};

router.post("/course/add", async function (req, res) {
  console.log("add");
  const course = {
    name: req.body.title,
    price: req.body.price,
    image: req.body.image,
    coursedescription: req.body.description,
    coursedetail: req.body.detail,
    statusid: req.body.statusid,
    updatedate: datetime,
    categoryId: req.body.category,
  };

  await courseModel.add(course);
  res.redirect("../admin/course");
});

module.exports = router;
