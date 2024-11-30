const dgram = require("dgram");
const os = require("os");
const axios = require("axios");
const amqp = require("amqplib/callback_api");

class LeaderElection {
  constructor(port = 41234, multicastAddress = "230.185.192.21") {
    this.port = port;
    this.multicastAddress = multicastAddress;
    this.serverId = this.generateServerId();
    this.isLeader = false;
    this.leaderServerId = null;
    this.udpSocket = dgram.createSocket("udp4");
    this.electionInProgress = false;
    this.electionTimeout = null;
    this.activeServers = new Set();
  }

  generateServerId() {
    const hostname = os.hostname();
    const randomSuffix = Math.floor(Math.random() * 10000);
    return `${hostname}-${randomSuffix}`;
  }

  initializeUDPServer() {
    this.udpSocket.bind(this.port, () => {
      this.udpSocket.addMembership(this.multicastAddress);
      console.log(`UDP Server bound on port ${this.port}`);

      // periodic track of active servers
      setInterval(() => this.broadcastHeartbeat(), 5000);

      // short delay to allow other servers to start before election
      setTimeout(() => this.startElection(), 3000);
    });

    this.udpSocket.on("message", (msg, rinfo) => {
      this.handleUDPMessage(msg.toString(), rinfo);
    });

    this.udpSocket.on("error", (err) => {
      console.error("UDP Socket Error:", err);
    });
  }

  broadcastHeartbeat() {
    const heartbeatMsg = JSON.stringify({
      type: "heartbeat",
      serverId: this.serverId,
      timestamp: Date.now(),
    });
    this.broadcastMessage(heartbeatMsg);
  }

  startElection() {
    if (this.electionInProgress) return;

    this.electionInProgress = true;
    console.log(`Starting leader election with server ID: ${this.serverId}`);

    // Broadcast election message
    const electionMsg = JSON.stringify({
      type: "election",
      serverId: this.serverId,
      timestamp: Date.now(),
    });

    this.broadcastMessage(electionMsg);

    // timeout for election completion
    this.electionTimeout = setTimeout(() => {
      this.finalizeElection();
    }, 5000);
  }

  handleUDPMessage(msgStr, rinfo) {
    try {
      const msg = JSON.parse(msgStr);

      switch (msg.type) {
        case "heartbeat":
          this.activeServers.add(msg.serverId);
          break;
        case "election":
          this.handleElectionMessage(msg);
          break;
        case "leader":
          this.handleLeaderMessage(msg);
          break;
      }
    } catch (error) {
      console.error("Error parsing UDP message:", error);
    }
  }

  handleElectionMessage(msg) {
    if (msg.serverId > this.serverId) {
      // Another server has higher priority, stop election
      this.electionInProgress = false;
      clearTimeout(this.electionTimeout);
    } else if (msg.serverId < this.serverId) {
      // Respond with higher priority
      const responseMsg = JSON.stringify({
        type: "election",
        serverId: this.serverId,
        timestamp: Date.now(),
      });
      this.broadcastMessage(responseMsg);
    }
  }

  handleLeaderMessage(msg) {
    this.leaderServerId = msg.serverId;
    this.isLeader = this.serverId === msg.serverId;
    this.electionInProgress = false;
    clearTimeout(this.electionTimeout);

    console.log(`Leader elected: ${this.leaderServerId}`);
    console.log(`Am I the leader? ${this.isLeader}`);
  }

  finalizeElection() {
    if (this.electionInProgress) {
      // If no other server responded, this server becomes the leader
      const leaderMsg = JSON.stringify({
        type: "leader",
        serverId: this.serverId,
        timestamp: Date.now(),
      });
      this.broadcastMessage(leaderMsg);
      this.isLeader = true;
      this.leaderServerId = this.serverId;
    }
  }

  broadcastMessage(message) {
    const buffer = Buffer.from(message);
    this.udpSocket.send(
      buffer,
      0,
      buffer.length,
      this.port,
      this.multicastAddress,
      (err) => {
        if (err) console.error("Broadcast error:", err);
      }
    );
  }

  initializeRabbitMQ(app) {
    amqp.connect("amqp://user:password@rabbitmq:5672", (error0, connection) => {
      if (error0) {
        console.error("RabbitMQ Connection Error:", error0);
        return;
      }

      connection.createChannel((error1, channel) => {
        if (error1) {
          console.error("RabbitMQ Channel Error:", error1);
          return;
        }

        console.log("Successfully connected to RabbitMQ!");
        const queue = "productQueue";
        channel.assertQueue(queue, { durable: false });
        console.log("Waiting for messages in", queue);

        app.get("/leader-status", (req, res) => {
          res.json({
            isLeader: this.isLeader,
            serverId: this.serverId,
            leaderServerId: this.leaderServerId,
            activeServers: Array.from(this.activeServers),
          });
        });

        // Leader-only message processing
        channel.consume(queue, async (msg) => {
          if (msg && this.isLeader) {
            const product = JSON.parse(msg.content.toString());
            console.log("Leader processing product data:", product);

            try {
              const response = await axios.post(
                "http://lab2-my_node_app-1:3000/api/products",
                {
                  ...product,
                  price: product.price.replace(",", "."),
                }
              );
              console.log("Product successfully sent to LAB2:", response.data);
            } catch (error) {
              console.error("Axios error:", error.message);
            }

            // Acknowledge the message
            channel.ack(msg);
          } else if (msg) {
            // Non-leader servers just acknowledge the message
            channel.ack(msg);
          }
        });
      });
    });
  }

  start(app) {
    this.initializeUDPServer();
    this.initializeRabbitMQ(app);
  }
}

module.exports = LeaderElection;
