const exphbs = require("express-handlebars");
const hbs_sections = require("express-handlebars-sections");
const numeral = require("numeral");

module.exports = (app) => {
  app.engine(
    "hbs",
    exphbs({
      defaultLayout: "main.hbs",
      extname: ".hbs",
      helpers: {
        section: hbs_sections(),
        format(val) {
          return numeral(val).format("0,0");
        },
      },
    })
  );
  app.set("view engine", "hbs");
};
