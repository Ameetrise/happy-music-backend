import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import midiRoutes from "./routes/midiInputs";
import scoreRoutes from "./routes/score";
import { generateRandomNote } from "./utils/generateNote";
import { noteToMidi } from "./utils/noteUtils";

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

// Middleware
app.use(cors());
app.use(express.json());

// DB
connectDB();

// Routes
app.get("/", (_, res) => {
  res.send("🎵 Happy Music Backend is running");
});
app.use("/api/scores", scoreRoutes);
app.use("/api/midi", midiRoutes);

// ======================
// Game Room Management
// ======================

interface RoomData {
  hostId: string;
  joinerId?: string;
}

interface NoteSettings {
  selectedClefs: ("treble" | "bass")[];
  trebleRange: [string, string];
  bassRange: [string, string];
}

const rooms: Record<string, RoomData> = {};
const currentNotes: Record<string, string> = {};
const previousNotes: Record<string, string> = {};
const roomSettings: Record<string, NoteSettings> = {};

// ======================
// Socket.IO Connections
// ======================

io.on("connection", (socket) => {
  console.log("🟢 Connected:", socket.id);

  // --- Host creates a room ---
  socket.on(
    "create_host",
    (
      settings: NoteSettings = {
        selectedClefs: ["treble", "bass"],
        trebleRange: ["C4", "C6"],
        bassRange: ["A2", "A4"],
      }
    ) => {
      const roomId = `room-${Math.random().toString(36).substring(2, 8)}`;
      rooms[roomId] = { hostId: socket.id };
      roomSettings[roomId] = settings;
      socket.join(roomId);

      const { note, clef } = generateRandomNote(
        settings.selectedClefs,
        settings.trebleRange,
        settings.bassRange,
        null
      );

      currentNotes[roomId] = note;
      previousNotes[roomId] = note;

      io.emit("joined_room", { roomId });
      socket.emit("new_note", { note, clef });

      console.log(`🎼 Host created room: ${roomId} with ${note} (${clef})`);
    }
  );

  // --- Joiner joins a room ---
  socket.on("join_any", () => {
    const availableRoom = Object.entries(rooms).find(
      ([_, room]) => !room.joinerId
    );

    if (availableRoom) {
      const [roomId, roomData] = availableRoom;
      roomData.joinerId = socket.id;
      socket.join(roomId);

      const note = currentNotes[roomId];
      const clef = noteToMidi(note) >= noteToMidi("C4") ? "treble" : "bass";

      io.to(roomData.hostId).emit("joiner_connected", { joinerId: socket.id });
      socket.emit("joined_room", { roomId });
      socket.emit("new_note", { note, clef });

      console.log(`🎹 Joinee joined room: ${roomId}`);
    } else {
      socket.emit("no_room_available");
    }
  });

  socket.on("close_room", ({ roomId }) => {
    if (rooms[roomId]?.hostId === socket.id) {
      io.to(roomId).emit("room_closed");
      delete rooms[roomId];
      delete roomSettings[roomId];
      delete currentNotes[roomId];
      delete previousNotes[roomId];
      console.log(`🚪 Room closed manually: ${roomId}`);
    }
  });

  // --- Joiner answers a note ---
  socket.on("note_answer", ({ roomId, answer }) => {
    const current = currentNotes[roomId];
    const settings = roomSettings[roomId];
    if (!current || !settings) return;

    const normalize = (note: string) =>
      note
        .trim()
        .toUpperCase()
        .replace(/[^A-G#b0-9]/g, "");

    const correct = normalize(answer) === normalize(current);
    console.log(`🎯 ${roomId} answer: ${answer} → ${correct ? "✅" : "❌"}`);

    if (correct) {
      const { note: nextNote, clef } = generateRandomNote(
        settings.selectedClefs,
        settings.trebleRange,
        settings.bassRange,
        previousNotes[roomId]
      );

      currentNotes[roomId] = nextNote;
      previousNotes[roomId] = nextNote;

      io.to(roomId).emit("new_note", { note: nextNote, clef });
    } else {
      socket.emit("wrong_note", { expected: current, received: answer });
    }
  });

  // --- Disconnect cleanup ---
  for (const [roomId, data] of Object.entries(rooms)) {
    const isHost = data.hostId === socket.id;
    const isJoiner = data.joinerId === socket.id;

    if (isHost || isJoiner) {
      console.log(
        `🔌 ${isHost ? "Host" : "Joiner"} disconnected from ${roomId}`
      );

      if (isHost) {
        io.to(roomId).emit("room_closed");
        delete rooms[roomId];
        delete roomSettings[roomId];
        delete currentNotes[roomId];
        delete previousNotes[roomId];
        console.log(`❌ Room closed: ${roomId}`);
      } else if (isJoiner) {
        rooms[roomId].joinerId = undefined;
        io.to(roomId).emit("joiner_disconnected");
      }
    }
  }
});

// ======================
// Start Server
// ======================

server.listen(PORT, () => {
  console.log(`🚀 Server + Socket.io running on port ${PORT}`);
});
