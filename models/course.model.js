const db = require("../utils/database");
const config = require("../config/default.json");
const TBL_COURSE = "courses";

module.exports = {
  all() {
    return db.load(`select * from ${TBL_COURSE}`);
  },

  async singleById(id) {
    const rows = await db.load(
      `select * from ${TBL_COURSE} where id = '${id}'`
    );
    if (rows.length === 0) return null;

    return rows[0];
  },

  allWithUsernameByPage(username, offset) {
    return db.load(
      `select c.*, s.StatusType from ${TBL_COURSE} c join status s on c.statusid = s.id where c.author = '${username}' limit ${config.pagination.limit} offset ${offset}`
    );
  },

  async countAllWithUsername(username) {
    const rows = await db.load(
      `select count(*) as total from ${TBL_COURSE} where author = '${username}'`
    );
    return rows[0].total;
  },

  delete(id) {
    const condition = { id: id };
    return db.del(condition, TBL_COURSE);
  },

  add(entity) {
    return db.add(entity, TBL_COURSE);
  },

  patch(entity) {
    const condition = { id: entity.Id };
    return db.patch(entity, condition, TBL_COURSE);
  },

  async checkIfCourseNameExist(courseId, courseName, username) {
    const rows = await db.load(
      `select * from ${TBL_COURSE} where author = '${username}' and name = '${courseName}' and id != '${courseId}'`
    );
    if (rows.length === 0) return null;

    return rows[0];
  },

  async singleByName(courseName, username) {
    const rows = await db.load(
      `select * from ${TBL_COURSE} where name = '${courseName}' and author = '${username}'`
    );
    if (rows.length === 0) return null;

    return rows[0];
  },
};
