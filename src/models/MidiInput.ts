import mongoose, { Schema, Document } from "mongoose";

export interface IMidiInput extends Document {
  userId: string;
  note: string;
  frequency: number;
  timestamp: Date;
}

const MidiInputSchema: Schema = new Schema({
  userId: { type: String, required: true },
  note: { type: String, required: true },
  frequency: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<IMidiInput>("MidiInput", MidiInputSchema);
