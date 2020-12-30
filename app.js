const express = require("express");

const app = express();
const favicon = require("serve-favicon");
const path = require("path");
const multer = require("multer");
require("express-async-errors");

app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(__dirname + "/public"));
app.use("/styles", express.static(__dirname + "/styles"));
app.use("/js", express.static(__dirname + "/js"));
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

require("./middlewares/view.mdw")(app);
require("./middlewares/session.mdw")(app);
require("./middlewares/locals.mdw")(app);
require("./middlewares/passport.mdw")(app);
require("./middlewares/routes.mdw")(app);
require("./middlewares/error.mdw")(app);

const PORT = process.env.PORT || 5555;
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
