const express = require("express");
const routes = require("./routes");

const app = express();

app.use(express.json());

app.use("/api", routes);
app.get("/favicon.ico", (req, res) => res.status(204));

app.listen(8000, () => {
  console.log(`Server is running`);
});
