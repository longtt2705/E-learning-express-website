const exphbs = require("express-handlebars");
const hbs_sections = require("express-handlebars-sections");
const numeral = require("numeral");
const moment = require("moment");

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
        formatDate(date) {
          return moment(date, "YYYY-MM-DD hh:mm:ss").format("DD-MM-YYYY LTS");
        },
        starPrint: function (value, option) {
          //In ngoi sao cua khoa hoc dua vao so diem danh gia
          var str = "";
          let index = 0;
          for (; index < value; index++) {
            str = str + "<span class='fa fa-star checked'> </span>";
          }

          for (; index < 5; index++) {
            str = str + "<span class='fa fa-star'> </span>";
          }

          return str + option.fn({ result: "" });
        },
      },
    })
  );
  app.set("view engine", "hbs");
};
