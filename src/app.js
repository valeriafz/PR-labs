const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes");

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.raw({ type: "application/xml" }));

app.use("/api", routes);

app.get("/favicon.ico", (req, res) => res.status(204));

app.listen(8000, () => {
  console.log(`Server is running on port 8000`);
});
