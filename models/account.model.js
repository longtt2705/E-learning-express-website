const db = require("../utils/database");
const config = require("../config/default.json");
const TBL_ACCOUNT = "accounts";

module.exports = {
  all() {
    return db.load(`select * from ${TBL_ACCOUNT}`);
  },

  async allWithoutAdminByPage(offset) {
    const rows = await db.load(
      `select a.*, r.*, s.statustype from ${TBL_ACCOUNT} a join roles r on a.roleid = r.id join status s on a.statusid = s.id where a.roleid != '1' limit ${config.pagination.limit} offset ${offset}`
    );
    if (rows.length === 0) return null;

    return rows;
  },

  async countAllWithoutAdmin() {
    const rows = await db.load(
      `select count(*) as total from ${TBL_ACCOUNT} where roleid != '1'`
    );
    return rows[0].total;
  },
  async countTeacher() {
    const rows = await db.load(
      `select count(*) as total from ${TBL_ACCOUNT} where roleid = '3'`
    );
    return rows[0].total;
  },
  async countStudent() {
    const rows = await db.load(
      `select count(*) as total from ${TBL_ACCOUNT} where roleid = '2'`
    );
    return rows[0].total;
  },

  async singleByUserName(username, provider = null) {
    let rows;
    if (provider === null)
      rows = await db.load(
        `select * from ${TBL_ACCOUNT} where username = '${username}' and provider is null`
      );
    else
      rows = await db.load(
        `select * from ${TBL_ACCOUNT} where username = '${username}' and provider = '${provider}'`
      );
    if (rows.length === 0) return null;

    return rows[0];
  },

  async singleByUserNameWithoutProvider(username) {
    const rows = await db.load(
      `select * from ${TBL_ACCOUNT} where username = '${username}'`
    );
    if (rows.length === 0) return null;

    return rows[0];
  },

  async searchWithLikeByPage(
    searchType,
    sort,
    order,
    content,
    offset,
    role = "all"
  ) {
    let query = null;
    if (role === "all") {
      query = `select * from ${TBL_ACCOUNT} a join roles r on a.roleid = r.id where roleid != '1' and ${searchType} like '%${content}%' order by ${order} ${sort} limit ${config.pagination.limit} offset ${offset}`;
    } else {
      query = `select * from ${TBL_ACCOUNT} a join roles r on a.roleid = r.id where roleid = '${role}' and ${searchType} like '%${content}%' order by ${order} ${sort} limit ${config.pagination.limit} offset ${offset}`;
    }
    return db.load(query);
  },

  async countAllWithLike(searchType, content, role = "all") {
    let query = null;
    if (role === "all") {
      query = `select count(*) as total from ${TBL_ACCOUNT} where roleid != '1' and ${searchType} like '%${content}%'`;
    } else {
      query = `select count(*) as total from ${TBL_ACCOUNT} where roleid = '${role}' and ${searchType} like '%${content}%'`;
    }
    const rows = await db.load(query);
    return rows[0].total;
  },

  async searchWithFullTextByPage(
    searchType,
    sort,
    order,
    content,
    offset,
    role = "all"
  ) {
    let query = null;
    if (role === "all") {
      query = `select * from ${TBL_ACCOUNT} a join roles r on a.roleid = r.id where roleid != '1' and ${searchType} like '%${content}%' order by ${order} ${sort} limit ${config.pagination.limit} offset ${offset}`;
    } else {
      query = `select * from ${TBL_ACCOUNT} a join roles r on a.roleid = r.id where roleid = '${role}' and MATCH(${searchType}) AGAINST('${content}' IN BOOLEAN MODE) order by ${order} ${sort} limit ${config.pagination.limit} offset ${offset}`;
    }
    return db.load(query);
  },

  async countAllWithFullText(searchType, content, role = "all") {
    let query = null;
    if (role === "all") {
      query = `select count(*) as total from ${TBL_ACCOUNT} where roleid != '1' and match(${searchType}) against('${content}' IN BOOLEAN MODE)`;
    } else {
      query = `select count(*) as total from ${TBL_ACCOUNT} where roleid = '${role}' and match(${searchType}) against('${content}' IN BOOLEAN MODE)`;
    }
    const rows = await db.load(query);
    return rows[0].total;
  },

  delete(username) {
    const condition = { username: username };
    return db.del(condition, TBL_ACCOUNT);
  },

  add(entity) {
    return db.add(entity, TBL_ACCOUNT);
  },

  patch(entity) {
    const condition = { username: entity.Username };
    console.log(entity);
    return db.patch(entity, condition, TBL_ACCOUNT);
  },
};
