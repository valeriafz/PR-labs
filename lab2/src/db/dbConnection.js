const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "my_mysql",
  user: "root",
  password: "rootpass",
  database: "product_db",
  port: 3306,
});

module.exports = db;
