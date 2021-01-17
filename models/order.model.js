const db = require("../utils/database");
const config = require("../config/default.json");
const TBL_ORDERS = "orders";
const TBL_ACCOUNT = "accounts";
module.exports = {
  all() {
    return db.load(`select * from ${TBL_ORDERS}`);
  },

  getCourseBoughtByUsername(courseId, username) {
    return db.load(
      `select c.id from ${TBL_ORDERS} o join orderdetails od on o.id = od.orderid join courses c on od.courseId = c.id where o.username = '${username}' and od.courseId = '${courseId}'`
    );
  },
  async getTotalOrder() {
    const row = await db.load(
      `select sum(totalcost) as total from ${TBL_ORDERS}`
    );
    return row[0].total;
  },
  async getHistoryOrder(limit = 10) {
    const row = await db.load(
      `SELECT Name as studentName,TotalCost as sale,RoleType as role FROM orders as orders  join accounts as acc on orders.Username=acc.Username join roles as rl on acc.RoleId = rl.id where RoleId = 2 group by orders.Id limit ${limit}`
    );
    return row;
  },
  async getTopCourseOrder() {
    const row = await db.load(
      `SELECT Name,count(Name) as total FROM orderdetails as orders join courses as courses on orders.CourseId = courses.Id group by Name; `
    );
    return row;
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
