const db = require("../utils/database");
const config = require("../config/default.json");
const TBL_ORDERS_DETAIL = "orderdetails";

module.exports = {
  all() {
    return db.load(`select * from ${TBL_ORDERS_DETAIL}`);
  },

  delete(id) {
    const condition = { id: id };
    return db.del(condition, TBL_ORDERS_DETAIL);
  },

  add(entity) {
    return db.add(entity, TBL_ORDERS_DETAIL);
  },

  patch(entity) {
    const condition = { id: entity.id };
    return db.patch(entity, condition, TBL_ORDERS_DETAIL);
  },
};
