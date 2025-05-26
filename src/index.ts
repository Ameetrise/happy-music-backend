import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import midiRoutes from "./routes/midiInputs";
import scoreRoutes from "./routes/score";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*", // Allow all origins for now
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// DB
connectDB();

// API Routes
app.get("/", (_, res) => {
  res.send("🎵 Happy Music Backend is running");
});
app.use("/api/scores", scoreRoutes);
app.use("/api/midi", midiRoutes);

io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  const interval = setInterval(() => {
    const data = {
      id: Math.floor(Math.random() * 1000),
      note: ["C4", "D4", "E4", "F4"][Math.floor(Math.random() * 4)],
      frequency: +(Math.random() * 1000).toFixed(2),
      timestamp: new Date().toISOString(),
    };

    socket.emit("random_object", data);
  }, 1000);

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
    clearInterval(interval); // Stop when user disconnects
  });
});

app.use("/api/scores", scoreRoutes);
server.listen(PORT, () => {
  console.log(`🚀 Server + Socket.io running on port ${PORT}`);
});
