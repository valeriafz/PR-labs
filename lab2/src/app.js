const express = require("express");
const db = require("../src/db/dbConnection");
const routes = require("./routes");

const app = express();

app.use(express.json());

app.locals.db = db;

app.use("/api", routes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
