export interface RoomData {
  hostId: string;
  joinerId?: string;
}

export interface NoteSettings {
  selectedClefs: ("treble" | "bass")[];
  trebleRange: [string, string];
  bassRange: [string, string];
}
