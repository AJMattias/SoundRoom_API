"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComodidadModel = exports.ComodidadSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
exports.ComodidadSchema = new mongoose_2.Schema({
    name: { type: String, unique: true },
    createdAt: Date
});
exports.ComodidadModel = mongoose_1.default.model("Comodidad", exports.ComodidadSchema);
