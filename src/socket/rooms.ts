import { Server } from "socket.io";
import { RoomData, NoteSettings } from "../types/socket";

export const rooms: Record<string, RoomData> = {};
export const roomSettings: Record<string, NoteSettings> = {};
export const currentNotes: Record<string, string> = {};
export const previousNotes: Record<string, string> = {};

export const closeRoom = (io: Server, roomId: string) => {
  io.to(roomId).emit("room_closed");
  delete rooms[roomId];
  delete roomSettings[roomId];
  delete currentNotes[roomId];
  delete previousNotes[roomId];
  console.log(`❌ Room closed: ${roomId}`);
};
