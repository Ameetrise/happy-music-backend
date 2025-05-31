import { Socket, Server } from "socket.io";
import { generateRandomNote } from "@ameetrise/core-lib";
import { noteToMidi } from "../utils/noteUtils";
import {
  rooms,
  roomSettings,
  currentNotes,
  previousNotes,
  closeRoom,
} from "./rooms";
import { normalizeNoteName } from "./utils";
import { NoteSettings } from "../types/socket";

export const registerSocketHandlers = (io: Server, socket: Socket) => {
  socket.on("create_host", (settings: NoteSettings) => {
    const roomId = `room-${Math.random().toString(36).substring(2, 8)}`;
    rooms[roomId] = { hostId: socket.id };
    roomSettings[roomId] = settings;
    socket.join(roomId);

    const { note, clef } = generateRandomNote({
      selectedClefs: settings.selectedClefs,
      trebleRange: settings.trebleRange,
      bassRange: settings.bassRange,
      previousNote: null,
    });

    currentNotes[roomId] = note;
    previousNotes[roomId] = note;

    socket.emit("host_created", { roomId });
    socket.broadcast.emit("room_available", { roomId });

    console.log(`🎼 Host created room: ${roomId}`);
  });

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
      io.to(roomId).emit("new_note", { note, clef });

      console.log(`🎹 Joiner joined room: ${roomId}`);
    } else {
      socket.emit("no_room_available");
    }
  });

  socket.on("note_answer", ({ roomId, answer }) => {
    const current = currentNotes[roomId];
    const settings = roomSettings[roomId];
    if (!current || !settings) return;

    const correct = normalizeNoteName(answer) === normalizeNoteName(current);

    if (correct) {
      socket.emit("correct_note", { note: current });

      const { note: nextNote, clef } = generateRandomNote({
        selectedClefs: settings.selectedClefs,
        trebleRange: settings.trebleRange,
        bassRange: settings.bassRange,
        previousNote: previousNotes[roomId],
      });

      currentNotes[roomId] = nextNote;
      previousNotes[roomId] = nextNote;
      io.to(roomId).emit("new_note", { note: nextNote, clef });
    } else {
      socket.emit("wrong_note", { expected: current, received: answer });
    }
  });

  socket.on("close_room", ({ roomId }) => {
    closeRoom(io, roomId);
  });

  socket.on("disconnect", () => {
    for (const [roomId, data] of Object.entries(rooms)) {
      if (data.hostId === socket.id || data.joinerId === socket.id) {
        closeRoom(io, roomId);
      }
    }
  });
};
