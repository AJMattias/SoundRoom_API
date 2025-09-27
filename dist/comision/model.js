"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComisionModel = exports.EnabledHistoryModel = exports.ComisionSchema = exports.EnabledHistorySchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
exports.EnabledHistorySchema = new mongoose_2.Schema({
    status: String,
    dateFrom: Date,
    dateTo: Date
});
exports.ComisionSchema = new mongoose_2.Schema({
    porcentaje: { type: Number, unique: true },
    createdAt: Date,
    deletedAt: Date,
    enabled: String,
    enabledHistory: [exports.EnabledHistorySchema],
});
exports.EnabledHistoryModel = mongoose_1.default.model("EnabledHistory", exports.EnabledHistorySchema);
exports.ComisionModel = mongoose_1.default.model("Comision", exports.ComisionSchema);
