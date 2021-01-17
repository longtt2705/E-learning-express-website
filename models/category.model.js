const db = require("../utils/database");
const config = require("../config/default.json");
const { singleByName } = require("./course.model");
const { load } = require("../utils/database");
const { countAllByCourseId } = require("./course-content.model");
const TBL_CATEGORIES = "categories";
const moment = require("moment");

module.exports = {
  all() {
    return db.load(`select * from ${TBL_CATEGORIES}`);
  },

  async singlebyId(Id) {
    let rows;
    rows = await db.load(`select * from ${TBL_CATEGORIES} where Id = ${Id}`);
    if (rows.length === 0) return null;

    return rows[0];
  },

  async singleByName(Name) {
    let rows;
    rows = await db.load(
      `select * from ${TBL_CATEGORIES} where Name="${Name}"`
    );
    if (rows.length === 0) return null;
    return rows;
  },

  async countByCategory(Id) {
    let rows;
    rows = await db.load(
      `select * 
      from categories join courses on categories.Id=courses.CategoryId
      where categories.ManagementId=${Id};`
    );
    if (rows.length === 0) {
      rows = await load(`select * from categories where Id=${Id}`);
    }
    return rows[0];
  },

  async countCourseById(Id) {
    let row;
    rows = await db.load(
      `select count(*)as SL from courses where CategoryId=${Id}`
    );
    return rows[0];
  },

  async singlebyId(Id){
    let rows;
    rows=await db.load(`select* from categories where ID=${Id}`);
    return rows[0];
  },
  additem(name,Id){
    return db.load(`insert into categories (Name, ManagementId) values ('${name}',${Id})`);
  },

  delete(Id) {
    const condition = { Id: Id };
    return db.del(condition, TBL_CATEGORIES);
  },

  add(entity) {
    return db.add(entity, TBL_CATEGORIES);
  },

  patch(entity) {
    const condition = { Id: entity.Id };
    return db.patch(entity, condition, TBL_CATEGORIES);
  },

  getTopCategoriesWithMostBuyLastWeek(limit = 6) {
    return db.load(
      `select cate.Id, count(od.CourseId) as totalBought from categories cate left join courses c on cate.Id = c.CategoryId left join orderdetails od on od.courseId = c.id left join orders o on od.OrderId = o.Id where cate.managementId is not null and if(DateCreate is not null, datecreate >= '${moment()
        .subtract(1, "weeks")
        .format(
          "YYYY-MM-DD HH:mm:ss"
        )}', datecreate is null) group by cate.Id order by totalBought DESC limit ${limit}`
    );
  },
};
