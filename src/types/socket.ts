import { IClef } from "@ameetrise/core-lib";

export interface RoomData {
  hostId: string;
  joinerId?: string;
}

export interface NoteSettings {
  selectedClefs: IClef[];
  trebleRange: [string, string];
  bassRange: [string, string];
}
