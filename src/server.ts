import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import { registerSocketHandlers } from "./socket/handlers";
import { SOCKET_EVENTS } from "@ameetrise/core-lib";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
  console.log("🟢 Connected:", socket.id);
  registerSocketHandlers(io, socket);
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port: ${PORT}`);
});
