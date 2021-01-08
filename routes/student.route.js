const { async } = require("crypto-random-string");
const express = require("express");
const { route } = require("./course.route");
const courseModel = require("../models/course.model");
const wishlistsModel=  require('../models/wishlist.model');
const auth = require("../middlewares/auth.mdw");
const router = express.Router();

function isStudent(req, res, next) {
  if (req.session.authUser.RoleId != 2) {
    return res.redirect("../");
  }
  next();
}
router.get("/course/:courseId/:chapterId/:lessonId", async (req, res) => {
  res.render("viewStudent/lessons");
});
router.get("/wishlist", auth, isStudent, async (req, res) => {
  const username = req.session.authUser.Username;
  const coursesIDs = await wishlistsModel.idAllCourseByName(username);
  const rows = [];
for (const courseId of coursesIDs) {
  const result = await courseModel.singleById(courseId.Courseid);
  rows.push(result)
}


  res.render("viewStudent/wishlist",{
  rows,
  empty: rows.length === 0,
  });
});
router.get("/wishlist/add/:courseId", auth, isStudent, async (req, res) => {
  const username = req.session.authUser.Username;
  const courseid = req.params.courseId;
  console.log("object",courseid);
  console.log("object1",username);
  const row ={Username:username,CourseId:courseid};
  console.log("2",row);
  await wishlistsModel.add(row);
  res.redirect("/course/"+courseid);
});
router.post("/wishlist/delete", auth, isStudent,async (req, res) => {
  const id = await wishlistsModel.singleIdByCourseID(req.body.Id);

  await wishlistsModel.delete(id);
  res.redirect("/student/wishlist")
});
router.get("/course", async (req, res) => {
  res.render("viewStudent/lessons");
});

module.exports = router;
