const db = require("../utils/database");
const config = require("../config/default.json");
const TBL_PROGRESS = "courseprogress";

module.exports = {
  all() {
    return db.load(`select * from ${TBL_PROGRESS}`);
  },

  async singleByUsernameAndCourse(username, courseId) {
    const rows = await db.load(
      `select * from ${TBL_PROGRESS} where courseId = '${courseId}' and username = '${username}'`
    );

    if (rows.length === 0) return null;
    return rows[0];
  },

  delete(id) {
    const condition = { id: id };
    return db.del(condition, TBL_PROGRESS);
  },

  add(entity) {
    return db.add(entity, TBL_PROGRESS);
  },

  patch(entity) {
    const condition = { id: entity.Id };
    return db.patch(entity, condition, TBL_PROGRESS);
  },
};
