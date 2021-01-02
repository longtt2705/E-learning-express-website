const db = require("../utils/database");
const config = require("../config/default.json");
const TBL_COURSE = "courses";

module.exports = {
  all() {
    return db.load(`select * from ${TBL_COURSE}`);
  },

  allWithUsernameByPage(username, offset) {
    return db.load(
      `select * from ${TBL_COURSE} c join status s on c.statusid = s.id where c.author = '${username}' limit ${config.pagination.limit} offset ${offset}`
    );
  },

  async countAllWithUsername(username) {
    const rows = await db.load(
      `select count(*) as total from ${TBL_COURSE} where author = '${username}'`
    );
    return rows[0].total;
  },

  delete(username) {
    const condition = { username: username };
    return db.del(condition, TBL_COURSE);
  },

  add(entity) {
    return db.add(entity, TBL_COURSE);
  },

  patch(entity) {
    const condition = { username: entity.Username };
    return db.patch(entity, condition, TBL_COURSE);
  },

  async singleByName(courseName) {
    const rows = await db.load(
      `select * from ${TBL_COURSE} where name = '${courseName}'`
    );
    if (rows.length === 0) return null;

    return rows[0];
  },
};
