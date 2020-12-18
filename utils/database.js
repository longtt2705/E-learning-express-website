const mysql = require('mysql');
const util = require('util');

const pool = mysql.createPool({
  host: 'localhost',
  port: 8889,
  user: 'root',
  password: 'root',
  database: 'qlbh',
  connectionLimit: 50,
});

const pool_query = util.promisify(pool.query).bind(pool);

module.exports = {
  load: sql => pool_query(sql),
  add: (entity, tableName) => pool_query(`insert into ${tableName} set ?`, entity),
  del: (condition, tableName) => pool_query(`delete from ${tableName} where ?`, condition),
  patch: (entity, condition, tableName) => pool_query(`update ${tableName} set ? where ?`, [entity, condition])

  // load(sql) {
  //   return pool_query(sql);
  // }

  // load(sql) {
  //   return new Promise(
  //     function (done, fail) {
  //       pool.query(sql, function (error, results, fields) {
  //         if (error)
  //           fail(error);
  //         else {
  //           done(results);
  //         }
  //       });
  //     });
  // }

  // load(sql, fn) {
  //   connection.connect();
  //   connection.query(sql, function (error, results, fields) {
  //     if (error)
  //       throw error;

  //     // console.log(fields);
  //     fn(results);
  //     connection.end();
  //   });
  // }
};
