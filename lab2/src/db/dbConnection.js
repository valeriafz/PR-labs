const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "lab2-my_mysql-1",
  user: "root",
  password: "rootpass",
  database: "product_db",
  port: 3306,
});

module.exports = { db };
