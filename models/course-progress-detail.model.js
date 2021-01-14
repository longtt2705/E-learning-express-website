const db = require("../utils/database");
const config = require("../config/default.json");
const TBL_PROGRESS_DETAIL = "coursedetailprogress";

module.exports = {
  all() {
    return db.load(`select * from ${TBL_PROGRESS_DETAIL}`);
  },

  allByLessonId(lessonId) {
    return db.load(
      `select * from ${TBL_PROGRESS_DETAIL} where lessonid = '${lessonId}'`
    );
  },

  async countAllByProgressId(progressId) {
    const rows = await db.load(
      `select count(*) as total from ${TBL_PROGRESS_DETAIL} where progressId = '${progressId}'`
    );
    return rows[0].total;
  },

  async singleByProgressIdAndLesson(lessonId, progressId) {
    const rows = await db.load(
      `select * from ${TBL_PROGRESS_DETAIL} where progressId = '${progressId}' and lessonid = '${lessonId}'`
    );
    if (rows.length === 0) return null;
    return rows[0];
  },

  delete(id) {
    const condition = { id: id };
    return db.del(condition, TBL_PROGRESS_DETAIL);
  },

  add(entity) {
    return db.add(entity, TBL_PROGRESS_DETAIL);
  },

  patch(entity) {
    const condition = { id: entity.Id };
    return db.patch(entity, condition, TBL_PROGRESS_DETAIL);
  },
};
