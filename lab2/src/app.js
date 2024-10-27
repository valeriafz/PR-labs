const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const db = require("../src/db/dbConnection");
const routes = require("../src/routes/index");

const app = express();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());

db.getConnection()
  .then(() => console.log("Database connected successfully!"))
  .catch((error) => console.error("Database connection failed:", error));

app.locals.db = db;

app.use("/api", routes);

const clients = new Set();

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (message) => {
    const data = JSON.parse(message);
    if (data.command === "join_room") {
      const joinMessage = `${data.username} has joined the chat.`;
      broadcast({ username: "Chat Bot", message: joinMessage });
      ws.send(JSON.stringify({ username: "Chat Bot", message: joinMessage }));
      clients.add({ ws, username: data.username });
    } else if (data.command === "send_msg") {
      broadcast({ username: data.username, message: data.message });
    } else if (data.command === "leave_room") {
      const leaveMessage = `${data.username} has left the chat.`;
      broadcast({ username: "Chat Bot", message: leaveMessage });
      clients.delete(
        Array.from(clients).find((client) => client.username === data.username)
      );
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    clients.delete(ws);
  });
});

const broadcast = (data) => {
  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(data));
    }
  });
};

const PORT_HTTP = 3000;
const PORT_WS = 3001;

server.listen(PORT_WS, "0.0.0.0", () => {
  console.log(`WebSocket server running on port ${PORT_WS}`);
});

app.listen(PORT_HTTP, "0.0.0.0", () => {
  console.log(`HTTP server running on port ${PORT_HTTP}`);
});
