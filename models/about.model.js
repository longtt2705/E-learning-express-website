const db = require("../utils/database");
const config = require("../config/default.json");


module.exports = {
  all() {
    return db.load(`select * from ${TBL_ACCOUNT}`);
  },
  all(){
      return db.load(`select  accounts.Name, accounts.Image, count(*) SL from accounts join courses on accounts.Username= courses.Author group by accounts.Name order by SL DESC limit 5`);
  },

};
