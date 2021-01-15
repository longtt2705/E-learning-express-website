const db = require("../utils/database");
const config = require("../config/default.json");
const TBL_ORDERS = "orders";

module.exports = {
  all() {
    return db.load(`select * from ${TBL_ORDERS}`);
  },

  getCourseBoughtByUsername(courseId, username) {
    return db.load(
      `select c.id from ${TBL_ORDERS} o join orderdetails od on o.id = od.orderid join courses c on od.courseId = c.id where o.username = '${username}' and od.courseId = '${courseId}'`
    );
  },

  getCoursesBoughtByUsername(username) {
    return db.load(
      `select c.id from ${TBL_ORDERS} o join orderdetails od on o.id = od.orderid join courses c on od.courseId = c.id where o.username = '${username}'`
    );
  },

  async countCoursesBoughtByUsername(username) {
    const rows = await db.load(
      `select count(*) as total from ${TBL_ORDERS} o join orderdetails od on o.id = od.orderid join courses c on od.courseId = c.id where o.username = '${username}'`
    );
    if (rows.length === 0) return 0;
    return rows[0].total;
  },

  getCoursesBoughtByUsernameByPage(username, offset) {
    return db.load(
      `select c.id from ${TBL_ORDERS} o join orderdetails od on o.id = od.orderid join courses c on od.courseId = c.id where o.username = '${username}' limit ${config.pagination.limit} offset ${offset}`
    );
  },

  delete(id) {
    const condition = { id: id };
    return db.del(condition, TBL_ORDERS);
  },

  add(entity) {
    return db.add(entity, TBL_ORDERS);
  },

  patch(entity) {
    const condition = { id: entity.id };
    return db.patch(entity, condition, TBL_ORDERS);
  },
};