import { Server } from "socket.io";
import { RoomData, NoteSettings } from "../types/socket";
import { SOCKET_EVENTS } from "@ameetrise/core-lib";

export const rooms: Record<string, RoomData> = {};
export const roomSettings: Record<string, NoteSettings> = {};
export const currentNotes: Record<string, string> = {};
export const previousNotes: Record<string, string> = {};

export const closeRoom = (io: Server, roomId: string) => {
  const { ROOM_CLOSED } = SOCKET_EVENTS;
  io.to(roomId).emit(ROOM_CLOSED);
  delete rooms[roomId];
  delete roomSettings[roomId];
  delete currentNotes[roomId];
  delete previousNotes[roomId];
  console.log(`❌ Room closed: ${roomId}`);
};
