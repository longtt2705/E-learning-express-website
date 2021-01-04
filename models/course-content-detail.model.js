const db = require("../utils/database");
const config = require("../config/default.json");
const { singleById, singleByName } = require("./course.model");
const TBL_COURSECONTENTDETAIL = "contentdetails";

module.exports = {
  all() {
    return db.load(`select * from ${TBL_COURSECONTENTDETAIL}`);
  },

  allByChapterId(chapterId) {
    return db.load(
      `select * from ${TBL_COURSECONTENTDETAIL} where contentid = '${chapterId}'`
    );
  },

  async singleById(id) {
    const rows = await db.load(
      `select * from ${TBL_COURSECONTENTDETAIL} where id = '${id}'`
    );
    if (rows.length === 0) return null;

    return rows[0];
  },

  async countAllByChapterId(chapterId) {
    const rows = await db.load(
      `select count(*) as total from ${TBL_COURSECONTENTDETAIL} where contentid = '${chapterId}'`
    );
    return rows[0].total;
  },

  async singleByNameInChapter(chapterId, name) {
    const rows = await db.load(
      `select * from ${TBL_COURSECONTENTDETAIL} where contentid = '${chapterId}' and name = '${name}'`
    );
    if (rows.length === 0) return null;

    return rows[0];
  },

  delete(id) {
    const condition = { id: id };
    return db.del(condition, TBL_COURSECONTENTDETAIL);
  },

  add(entity) {
    return db.add(entity, TBL_COURSECONTENTDETAIL);
  },

  patch(entity) {
    const condition = { id: entity.Id };
    return db.patch(entity, condition, TBL_COURSECONTENTDETAIL);
  },
};
