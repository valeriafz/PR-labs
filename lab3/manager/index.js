// command to make copies docker-compose up --scale manager=3

const express = require("express");
const LeaderElection = require("./leaderElection");

const app = express();
app.use(express.json());

const leaderElection = new LeaderElection();

const PORT = 4000;

const server = app.listen(PORT, () => {
  console.log(`Manager server running on port ${PORT}`);

  leaderElection.start(app);
});
