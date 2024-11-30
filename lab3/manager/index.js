// command to make copies docker-compose up --scale manager=3

const express = require("express");
const LeaderElection = require("./leaderElection");

const app = express();
app.use(express.json());

const leaderElection = new LeaderElection();

app.post("/update-leader", (req, res) => {
  const { serverId, hostname } = req.body;
  console.log(
    `Received leadership update from ${hostname} with server ID ${serverId}`
  );

  res.status(200).json({ message: "Leader update received" });
});

const PORT = 4000;

const server = app.listen(PORT, () => {
  console.log(`Manager server running on port ${PORT}`);

  leaderElection.start(app);
});
