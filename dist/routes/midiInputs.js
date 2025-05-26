"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const midiInputController_1 = require("../controllers/midiInputController");
const router = express_1.default.Router();
router.post("/", midiInputController_1.saveMidiInput);
router.get("/:userId", midiInputController_1.getMidiInputs);
exports.default = router;
