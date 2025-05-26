import { Request, Response } from "express";
import MidiInput from "../models/MidiInput";

export const saveMidiInput = async (req: Request, res: Response) => {
  try {
    const midi = await MidiInput.create(req.body);
    res.status(201).json(midi);
  } catch (error) {
    res.status(500).json({ error: "Failed to save MIDI input" });
  }
};

export const getMidiInputs = async (req: Request, res: Response) => {
  try {
    const inputs = await MidiInput.find({ userId: req.params.userId });
    res.json(inputs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch MIDI inputs" });
  }
};
