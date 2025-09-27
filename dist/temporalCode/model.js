"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TempCodeModel = exports.TempCodeSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
exports.TempCodeSchema = new mongoose_2.Schema({
    user: {
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'User'
    },
    email: String,
    password: String,
    verificationCode: String,
    verificationCodeExpires: Date,
});
exports.TempCodeModel = mongoose_1.default.model("TempCode", exports.TempCodeSchema);
