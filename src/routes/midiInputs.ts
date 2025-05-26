import express from "express";
import {
  saveMidiInput,
  getMidiInputs,
} from "../controllers/midiInputController";

const router = express.Router();

router.post("/", saveMidiInput);
router.get("/:userId", getMidiInputs);

export default router;
