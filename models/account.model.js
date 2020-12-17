const db = require("../utils/database");

const TBL_ACCOUNT = "accounts";

module.exports = {
  all() {
    return db.load(`select * from ${TBL_ACCOUNT}`);
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

  add(entity) {
    return db.add(entity, TBL_ACCOUNT);
  },

  updateConfirmEmail(entity) {
    const condition = { username: entity.Username };
    delete entity.Username;
    return db.patch(entity, condition, TBL_ACCOUNT);
  },
};
