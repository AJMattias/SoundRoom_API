"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagenModel = exports.ImagenSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
exports.ImagenSchema = new mongoose_2.Schema({
    //id: {type: String, unique: true},
    url: String,
    titulo: String,
    descripcion: String,
    public_id: String,
    visible: Boolean,
    createdAt: Date,
    deletedAt: Date
});
exports.ImagenModel = mongoose_1.default.model("Imagen", exports.ImagenSchema);
