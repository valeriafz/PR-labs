const express = require("express");
const db = require("../src/db/dbConnection");
const routes = require("../src/routes/index");

const app = express();

app.use(express.json());

db.getConnection()
  .then((connection) => {
    console.log("Database connection successful!");
    connection.release();
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });

app.use("/api", routes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
