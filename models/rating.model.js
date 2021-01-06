const db = require("../utils/database");
const config = require("../config/default.json");
const TBL_RATING = "rating";

module.exports = {
  all() {
    return db.load(`select * from ${TBL_RATING}`);
  },

  async sumaryRatingByCourse(courseId) {
    const rows = await db.load(
      `select format(avg(r.rate), 1) as AverageRate, count(r.rate) as totalRate from courses c join rating r on c.Id = r.courseId where c.Id = '${courseId}'`
    );
    if (rows.length === 0) return null;
    return rows[0];
  },

  delete(id) {
    const condition = { id: id };
    return db.del(condition, TBL_RATING);
  },

  add(entity) {
    return db.add(entity, TBL_RATING);
  },

  patch(entity) {
    const condition = { id: entity.Id };
    return db.patch(entity, condition, TBL_RATING);
  },
};
