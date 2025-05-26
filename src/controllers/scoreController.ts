import { Request, Response } from "express";
import Score from "../models/Score";

export const saveScore = async (req: Request, res: Response) => {
  try {
    const score = await Score.create(req.body);
    res.status(201).json(score);
  } catch (error) {
    res.status(500).json({ error: "Failed to save score" });
  }
};

export const getScores = async (req: Request, res: Response) => {
  try {
    const scores = await Score.find({ userId: req.params.userId });
    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch scores" });
  }
};
