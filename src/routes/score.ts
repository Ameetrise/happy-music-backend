import express from "express";
import { saveScore, getScores } from "../controllers/scoreController";

const router = express.Router();

router.post("/", saveScore);
router.get("/:userId", getScores);

export default router;
