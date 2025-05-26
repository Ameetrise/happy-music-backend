"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const scoreController_1 = require("../controllers/scoreController");
const router = express_1.default.Router();
router.post("/", scoreController_1.saveScore);
router.get("/:userId", scoreController_1.getScores);
exports.default = router;
