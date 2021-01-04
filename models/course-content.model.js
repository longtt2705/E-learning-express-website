const db = require("../utils/database");
const config = require("../config/default.json");
const TBL_COURSECONTENT = "coursecontents";

module.exports = {
  all() {
    return db.load(`select * from ${TBL_COURSECONTENT}`);
  },

  allByCourseId(courseId) {
    return db.load(
      `select * from ${TBL_COURSECONTENT} where courseid = '${courseId}'`
    );
  },

  async singleById(id, courseId) {
    const rows = await db.load(
      `select * from ${TBL_COURSECONTENT} where id = '${id}' and courseid = ${courseId}`
    );
    if (rows.length === 0) return null;

    return rows[0];
  },

  async checkIfChapterNameExist(courseId, chapterId, chapterName) {
    const rows = await db.load(
      `select * from ${TBL_COURSECONTENT} where courseid = '${courseId}' and id != '${chapterId}' and chaptername='${chapterName}'`
    );
    if (rows.length === 0) return null;

    return rows[0];
  },

  async countAllByCourseId(courseId) {
    const rows = await db.load(
      `select count(*) as total from ${TBL_COURSECONTENT} where courseid = '${courseId}'`
    );
    return rows[0].total;
  },

  delete(id) {
    const condition = { id: id };
    return db.del(condition, TBL_COURSECONTENT);
  },

  add(entity) {
    return db.add(entity, TBL_COURSECONTENT);
  },

  patch(entity) {
    const condition = { id: entity.Id };
    return db.patch(entity, condition, TBL_COURSECONTENT);
  },
};
