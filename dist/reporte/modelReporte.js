"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportesModel = exports.ReportesSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
exports.ReportesSchema = new mongoose_2.Schema({
    mes: Number,
    cantidad: Number
});
exports.ReportesModel = mongoose_1.default.model("Reportes", exports.ReportesSchema);
