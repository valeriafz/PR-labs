const express = require("express");
const db = require("../src/db/dbConnection");
const routes = require("../src/routes/index");

const app = express();

app.use(express.json());

db.getConnection()
  .then(() => console.log("Database connected successfully!"))
  .catch((error) => console.error("Database connection failed:", error));

app.locals.db = db;

app.use("/api", routes);

const PORT = 3000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);
