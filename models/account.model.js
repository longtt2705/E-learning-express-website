const db = require("../utils/database");

const TBL_ACCOUNT = "accounts";

module.exports = {
  all() {
    return db.load(`select * from ${TBL_ACCOUNT}`);
  },

  async allWithoutAdmin() {
    let rows;

    rows = await db.load(
      `select * from ${TBL_ACCOUNT} a join roles r on a.roleid = r.id where a.roleid != '1' `
    );
    if (rows.length === 0) return null;

    return rows;
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
