"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateSalaEnsayoModel = exports.TypeModel = exports.StateSalaEnsayoSchema = exports.TypeSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
exports.TypeSchema = new mongoose_2.Schema({
    name: { type: String, unique: true },
    createdAt: Date
});
exports.StateSalaEnsayoSchema = new mongoose_2.Schema({
    name: { type: String, unique: true },
    createdAt: Date
});
exports.TypeModel = mongoose_1.default.model("Type", exports.TypeSchema);
exports.StateSalaEnsayoModel = mongoose_1.default.model("StateSalaEnsayo", exports.StateSalaEnsayoSchema);
