"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstadoUsuarioModel = exports.EstadoUsuarioSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
exports.EstadoUsuarioSchema = new mongoose_2.Schema({
    createdAt: Date,
    deletedAt: Date,
    estado: String
});
exports.EstadoUsuarioModel = mongoose_1.default.model("EstadoUsuario", exports.EstadoUsuarioSchema);
