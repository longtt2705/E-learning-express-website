const db = require("../utils/database");
const config = require("../config/default.json");
const TBL_WISHLIST = "wishlists";
module.exports = {
    all() {
      return db.load(`select * from ${TBL_WISHLIST}`);
    },
  
    async countAll() {
      const rows = await db.load(`select count(*) as total from ${TBL_WISHLIST}`);
      if (rows.length === 0) return 0;
      return rows[0].total;
    },
  
    async singleById(id) {
      const rows = await db.load(
        `select * from ${TBL_WISHLIST} where id = '${id}'`
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
  
  
 
  
    async countAllWithUsername(username) {
      const rows = await db.load(
        `select count(*) as total from ${TBL_WISHLIST} where Username = '${username}'`
      );
      if (rows.length === 0) return 0;
      return rows[0].total;
    },
    async singleIdByCourseID(id) {
      const rows = await db.load(
        `select id from ${TBL_WISHLIST} where Courseid = '${id}'`
      );
      if (rows.length === 0) return null;
  
      return rows[0];
    },
    delete(id) {
      
      
      return db.del(id, TBL_WISHLIST);
    },
  
    add(entity) {
      return db.add(entity, TBL_WISHLIST);
    },
  
    async idAllCourseByName(username) {
      const rows = await db.load(
        `select Courseid from ${TBL_WISHLIST} where Username = '${username}'`
      );

      return rows;
    },
  };