const db = require("../utils/database");
const config = require("../config/default.json");
const TBL_COURSECONTENTDETAIL = "contentdetails";

module.exports = {
  all() {
    return db.load(`select * from ${TBL_COURSECONTENTDETAIL}`);
  },

  delete(username) {
    const condition = { username: username };
    return db.del(condition, TBL_COURSECONTENTDETAIL);
  },

  add(entity) {
    return db.add(entity, TBL_COURSECONTENTDETAIL);
  },

  patch(entity) {
    const condition = { username: entity.Username };
    return db.patch(entity, condition, TBL_COURSECONTENTDETAIL);
  },
};
