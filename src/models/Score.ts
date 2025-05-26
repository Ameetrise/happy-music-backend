import mongoose, { Schema, Document } from "mongoose";

export interface IScore extends Document {
  userId: string;
  score: number;
  createdAt: Date;
}

const ScoreSchema: Schema = new Schema({
  userId: { type: String, required: true },
  score: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IScore>("Score", ScoreSchema);
