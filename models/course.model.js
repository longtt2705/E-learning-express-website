const db = require("../utils/database");
const config = require("../config/default.json");
const TBL_COURSE = "courses";

const selectField = `select DISTINCT c.*, s.StatusType, a.name as authorName, a.image as authorImage, a.description, cat.Name as CateName, format(avg(r.rate), 1) as AverageRate, count(r.rate) as TotalRate from courses c join status s on c.statusid = s.id join categories cat on c.categoryid = cat.id join accounts a on a.username = c.author left join rating r on r.CourseId = c.Id`;
const countField = `select count(DISTINCT c.id) as total, cat.Name as CateName from courses c left join rating r on r.CourseId = c.Id join categories cat on c.categoryid = cat.id`;

module.exports = {
  all() {
    return db.load(`select * from ${TBL_COURSE}`);
  },

  async countAll() {
    const rows = await db.load(`select count(*) as total from ${TBL_COURSE}`);
    if (rows.length === 0) return 0;
    return rows[0].total;
  },

  async singleById(id) {
    const rows = await db.load(
      `select * from ${TBL_COURSE} where id = '${id}'`
    );
    if (rows.length === 0) return null;

    return rows[0];
  },

  async singleByIdWithInfo(id) {
    const rows = await db.load(
      `${selectField} where c.id = '${id}' group by c.Id`
    );
    if (rows.length === 0) return null;

    return rows[0];
  },

  allByPage(offset) {
    return db.load(
      `${selectField} group by c.Id limit ${config.pagination.limit} offset ${offset}`
    );
  },

  allWithUsernameByPage(username, offset) {
    return db.load(
      `${selectField} where c.author = '${username}' group by c.Id limit ${config.pagination.limit} offset ${offset}`
    );
  },

  async countAllWithUsername(username) {
    const rows = await db.load(
      `select count(*) as total from ${TBL_COURSE} where author = '${username}'`
    );
    if (rows.length === 0) return 0;
    return rows[0].total;
  },

  async searchWithLikeByPage(searchType, sort, order, content, offset) {
    return db.load(
      `${selectField} where ${searchType} like '%${content}%' group by c.Id order by ${order} ${sort} limit ${config.pagination.limit} offset ${offset}`
    );
  },

  async countAllWithLike(searchType, content) {
    const rows = await db.load(
      `${countField} where ${searchType} like '%${content}%' group by c.Id`
    );
    if (rows.length === 0) return 0;
    return rows[0].total;
  },

  async searchWithFullTextByPage(searchType, sort, order, content, offset) {
    return db.load(
      `${selectField} where MATCH(${searchType}) AGAINST('${content}' IN BOOLEAN MODE) group by c.Id order by ${order} ${sort} limit ${config.pagination.limit} offset ${offset}`
    );
  },

  async countAllWithFullText(searchType, content) {
    const rows = await db.load(
      `${countField} where match(${searchType}) against('${content}' IN BOOLEAN MODE) group by c.Id`
    );
    if (rows.length === 0) return 0;
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
