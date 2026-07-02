const express = require("express");
const { WebSocketServer, WebSocket } = require("ws");
const http = require("node:http");
const path = require("node:path");

const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, "public")));

const wss = new WebSocketServer({ server });

const EVENTS = {
  JOIN: "join",
  JOINED: "joined",
  MESSAGE: "message",
  CONNECTED: "connected",
  DISCONNECTED: "disconnected",
  ERROR: "error",
};

function send(socket, data) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  }
}

function broadcast(data, except = null) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== except) {
      send(client, data);
    }
  });
}

wss.on("connection", (socket, request) => {
  const ip = request.socket.remoteAddress === "::1" ? "localhost" : request.socket.remoteAddress;
  const port = request.socket.remotePort;
  socket.clientId = `[${ip}:${port}]`;
  socket.username = null;
  console.log(`${socket.clientId} connected.`);

  socket.on("message", (rawData) => {
    let data;
    try {
      data = JSON.parse(rawData.toString());
    } catch {
      return send(socket, {
        type: EVENTS.ERROR,
        message: "Invalid JSON.",
        timestamp: Date.now(),
      });
    }

    switch (data.type) {

      case EVENTS.JOIN: {
        const username = data.username?.trim();

        if (!username) {
          return send(socket, {
            type: EVENTS.ERROR,
            message: "Username is required.",
            timestamp: Date.now(),
          });
        }

        socket.username = username;

        console.log(`${username} ${socket.clientId} joined.`);

        send(socket, {
          type: "joined",
          username,
          clientId: socket.clientId,
          timestamp: Date.now(),
        });

        broadcast({
            type: EVENTS.CONNECTED,
            username,
            clientId: socket.clientId,
            timestamp: Date.now(),
          },socket);

        break;
      }

      case EVENTS.MESSAGE: {
        if (!socket.username) {
          return send(socket, {
            type: EVENTS.ERROR,
            message: "Join before sending messages.",
            timestamp: Date.now(),
          });
        }

        const message = data.message?.trim();

        if (!message) return;

        if (message.length > 500) {
          return send(socket, {
            type: EVENTS.ERROR,
            message: "Maximum message length is 500 characters.",
            timestamp: Date.now(),
          });
        }

        console.log(`${socket.username}: ${message}`);

        broadcast({
            type: EVENTS.MESSAGE,
            username: socket.username,
            clientId: socket.clientId,
            message,
            timestamp: Date.now(),
          },socket);

        break;
      }

      default:
        send(socket, {
          type: EVENTS.ERROR,
          message: "Unknown event type.",
          timestamp: Date.now(),
        });
    }
  });

  socket.on("close", () => {
    console.log(`${socket.clientId} disconnected.`);

    if (!socket.username) return;

    broadcast({
        type: EVENTS.DISCONNECTED,
        username: socket.username,
        clientId: socket.clientId,
        timestamp: Date.now(),
      },socket);
  });

  socket.on("error", (err) => {
    console.log(err.message);
  });
});

module.exports = server;
