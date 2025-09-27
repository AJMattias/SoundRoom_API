"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfiguracionModel = exports.ConfiguracionSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
exports.ConfiguracionSchema = new mongoose_2.Schema({
    tiempoBloqueo: Number,
    maximoIntentos: Number,
    porcentajeComision: Number,
    createdAt: Date,
    deletedAt: Date
});
exports.ConfiguracionModel = mongoose_1.default.model("Configuracion", exports.ConfiguracionSchema);
