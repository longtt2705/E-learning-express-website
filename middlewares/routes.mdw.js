module.exports = (app) => {
  app.get("/", function (req, res) {
    res.render("home");
  });

  app.use("/account", require("../routes/account.route"));
  app.use("/admin", require("../routes/admin.route"));
  app.use("/auth", require("../routes/auth.route"));
  app.use("/teacher", require("../routes/teacher.route"));
  app.use("/course", require("../routes/course.route"));
  app.use("/student", require("../routes/student.route"));
};
