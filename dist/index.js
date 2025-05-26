"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const midiInputs_1 = __importDefault(require("./routes/midiInputs"));
const score_1 = __importDefault(require("./routes/score"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*", // Allow all origins for now
        methods: ["GET", "POST"],
    },
});
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// DB
(0, db_1.default)();
// API Routes
app.use("/api/scores", score_1.default);
app.use("/api/midi", midiInputs_1.default);
// Socket.io Connection
io.on("connection", (socket) => {
    console.log("🟢 Client connected:", socket.id);
    socket.on("disconnect", () => {
        console.log("🔴 Client disconnected:", socket.id);
    });
    // Receive and broadcast MIDI note events
    socket.on("midi_note", (data) => {
        console.log("🎵 MIDI note received:", data);
        socket.broadcast.emit("midi_note", data); // Send to all except sender
    });
});
app.use("/api/scores", score_1.default);
server.listen(PORT, () => {
    console.log(`🚀 Server + Socket.io running on port ${PORT}`);
});
