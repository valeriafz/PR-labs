const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "rootpass",
  database: "product_db",
  port: 3307,
});

module.exports = db;
