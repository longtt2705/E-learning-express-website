const db = require("../utils/database");
const config = require("../config/default.json");
const TBL_CATEGORIES = "categories";

module.exports = {
  all() {
    return db.load(`select * from ${TBL_CATEGORIES}`);
  },

  delete(id) {
    const condition = { id: id };
    return db.del(condition, TBL_CATEGORIES);
  },

  add(entity) {
    return db.add(entity, TBL_CATEGORIES);
  },

  patch(entity) {
    const condition = { id: entity.Id };
    return db.patch(entity, condition, TBL_CATEGORIES);
  },
};
