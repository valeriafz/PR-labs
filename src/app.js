const express = require("express");
const routes = require("./routes");

const app = express();

app.use(express.json());

app.use("/api", routes);
// Handle favicon requests
app.get("/favicon.ico", (req, res) => res.status(204)); // Respond with 204 No Content

app.listen(8000, () => {
  console.log(`Server is running`);
});
