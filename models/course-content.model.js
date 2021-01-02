const db = require("../utils/database");
const config = require("../config/default.json");
const TBL_COURSECONTENT = "coursecontents";

module.exports = {
  all() {
    return db.load(`select * from ${TBL_COURSECONTENT}`);
  },

  delete(username) {
    const condition = { username: username };
    return db.del(condition, TBL_COURSECONTENT);
  },

  add(entity) {
    return db.add(entity, TBL_COURSECONTENT);
  },

  patch(entity) {
    const condition = { username: entity.Username };
    return db.patch(entity, condition, TBL_COURSECONTENT);
  },
};
