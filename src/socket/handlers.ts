import { Socket, Server } from "socket.io";
import {
  generateRandomNote,
  normalizeNoteName,
  STRINGS,
} from "@ameetrise/core-lib";
import { noteToMidi } from "../utils/noteUtils";
import {
  rooms,
  roomSettings,
  currentNotes,
  previousNotes,
  closeRoom,
} from "./rooms";
import { NoteSettings } from "../types/socket";
import { SOCKET_EVENTS } from "@ameetrise/core-lib";

export const registerSocketHandlers = (io: Server, socket: Socket) => {
  const {
    CREATE_HOST,
    HOST_CREATED,
    CLOSE_ROOM,
    ROOM_AVAILABLE,
    JOIN_ANY,
    JOINER_CONNECTED,
    JOINED_ROOM,
    NOTE_ANSWER,
    NEW_NOTE,
    CORRECT_NOTE,
    WRONG_NOTE,
    DISCONNECT,
    NO_ROOM_AVAILABLE,
  } = SOCKET_EVENTS;
  const { treble, bass } = STRINGS;
  socket.on(CREATE_HOST, (settings: NoteSettings) => {
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

    socket.emit(HOST_CREATED, { roomId });
    socket.broadcast.emit(ROOM_AVAILABLE, { roomId });

    console.log(`🎼 Host created room: ${roomId}`);
  });

  socket.on(JOIN_ANY, () => {
    const availableRoom = Object.entries(rooms).find(
      ([_, room]) => !room.joinerId
    );

    if (availableRoom) {
      const [roomId, roomData] = availableRoom;
      roomData.joinerId = socket.id;
      socket.join(roomId);

      const note = currentNotes[roomId];
      const clef = noteToMidi(note) >= noteToMidi("C4") ? treble : bass;

      io.to(roomData.hostId).emit(JOINER_CONNECTED, { joinerId: socket.id });
      socket.emit(JOINED_ROOM, { roomId });
      io.to(roomId).emit(NEW_NOTE, { note, clef });

      console.log(`🎹 Joiner joined room: ${roomId}`);
    } else {
      socket.emit(NO_ROOM_AVAILABLE);
    }
  });

  socket.on(NOTE_ANSWER, ({ roomId, answer }) => {
    const current = currentNotes[roomId];
    const settings = roomSettings[roomId];
    if (!current || !settings) return;

    const correct = normalizeNoteName(answer) === normalizeNoteName(current);

    if (correct) {
      socket.emit(CORRECT_NOTE, { note: current });

      const { note: nextNote, clef } = generateRandomNote({
        selectedClefs: settings.selectedClefs,
        trebleRange: settings.trebleRange,
        bassRange: settings.bassRange,
        previousNote: previousNotes[roomId],
      });

      currentNotes[roomId] = nextNote;
      previousNotes[roomId] = nextNote;
      io.to(roomId).emit(NEW_NOTE, { note: nextNote, clef });
    } else {
      socket.emit(WRONG_NOTE, { expected: current, received: answer });
    }
  });

  socket.on(CLOSE_ROOM, ({ roomId }) => {
    closeRoom(io, roomId);
  });

  socket.on(DISCONNECT, () => {
    for (const [roomId, data] of Object.entries(rooms)) {
      if (data.hostId === socket.id || data.joinerId === socket.id) {
        closeRoom(io, roomId);
      }
    }
  });
};
