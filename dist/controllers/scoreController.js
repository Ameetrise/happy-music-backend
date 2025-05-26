"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScores = exports.saveScore = void 0;
const Score_1 = __importDefault(require("../models/Score"));
const saveScore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const score = yield Score_1.default.create(req.body);
        res.status(201).json(score);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to save score" });
    }
});
exports.saveScore = saveScore;
const getScores = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const scores = yield Score_1.default.find({ userId: req.params.userId });
        res.json(scores);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch scores" });
    }
});
exports.getScores = getScores;
