const db = require("../utils/database");
const config = require("../config/default.json");
const { allByCourseId } = require("./course-content.model");
const { singleByUsernameAndCourse } = require("./course-progress.model");
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

  async singleByUsernameAndCourse(courseId, username) {
    const rows = await db.load(
      `select * from ${TBL_RATING} where courseId = '${courseId}' and username = '${username}'`
    );
    if (rows.length === 0) return null;
    return rows[0];
  },

  async allByCourseIdWithInfo(courseId) {
    return db.load(
      `select * from ${TBL_RATING} r join accounts a on r.username = a.username where courseid = '${courseId}'`
    );
  },

  async countRatingByStars(courseId, stars) {
    const rows = await db.load(
      `select count(*) as total from ${TBL_RATING} where courseid = '${courseId}' and rate <= ${stars} and rate > ${
        stars - 1
      }`
    );
    if (rows.length === 0) return 0;
    return rows[0].total;
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
