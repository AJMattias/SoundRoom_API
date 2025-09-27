"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalityModel = exports.LocalitySchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
var Province = mongoose_1.default.model('Province');
exports.LocalitySchema = new mongoose_2.Schema({
    nameLocality: {
        type: String,
        unique: true,
        required: true,
    },
    idProvince: {
        type: mongoose_2.Schema.Types.ObjectId,
        ref: "Province",
    },
});
exports.LocalityModel = mongoose_1.default.model("Locality", exports.LocalitySchema);
