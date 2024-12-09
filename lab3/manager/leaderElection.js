const dgram = require("dgram");
const os = require("os");
const axios = require("axios");
const amqp = require("amqplib/callback_api");

class LeaderElection {
  constructor(port = 41234, multicastAddress = "230.185.192.21") {
    //private multicast usage
    this.port = port; // UDP port to communicate on
    this.multicastAddress = multicastAddress; // Special IP for group communication
    this.serverId = this.generateServerId();
    this.isLeader = false;
    this.leaderServerId = null; // ID of the current leader
    this.udpSocket = dgram.createSocket("udp4");
    this.electionInProgress = false; // Flag to track if an election is happening
    this.electionTimeout = null;
    this.activeServers = new Set(); // Track active servers in the network
  }

  generateServerId() {
    const hostname = os.hostname();
    const randomSuffix = Math.floor(Math.random() * 10000);
    return `${hostname}-${randomSuffix}`;
  }

  initializeUDPServer() {
    this.udpSocket.bind(this.port, () => {
      //Binds the server to the specified port
      this.udpSocket.addMembership(this.multicastAddress); // Join multicast group.
      console.log(`UDP Server bound on port ${this.port}`);

      // periodic track of active servers
      setInterval(() => this.broadcastHeartbeat(), 5000);

      // short delay to allow other servers to start before election
      setTimeout(() => this.startElection(), 3000);
    });
    //handles incoming UDP messages as they arrive, without blocking other parts of the program.
    this.udpSocket.on("message", (msg, rinfo) => {
      //rinfo= source of the message.
      this.handleUDPMessage(msg.toString(), rinfo); // Handle incoming messages.
    });

    this.udpSocket.on("error", (err) => {
      console.error("UDP Socket Error:", err);
    });
  }

  // Every 5 seconds, the server announces "I'm alive!" to other servers.
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
      this.finalizeElection(); // Declare self as leader if no response.
    }, 5000);
  }

  handleUDPMessage(msgStr, rinfo) {
    try {
      const msg = JSON.parse(msgStr);

      switch (msg.type) {
        case "heartbeat":
          // tracks active servers
          this.activeServers.add(msg.serverId);
          break;
        case "election":
          // voting process
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
      // Another server has higher priority/ ID, stop competing
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
    // UDP sockets send raw binary data, so the message must be encoded into a binary format (Buffer)
    const buffer = Buffer.from(message);

    console.log(`Broadcasting message: ${message}`);

    this.udpSocket.send(
      buffer,
      0, // pffeset to start sending from the beggining
      buffer.length, //nr of bytes
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

        channel.assertQueue(queue, { durable: false }); //ensures the queue exists, durability is temporary so speedy

        console.log("Waiting for messages in", queue);

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

            // Acknowledge the message, consumer confirms processed message
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
