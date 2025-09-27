"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerfilModel = exports.PerfilSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
exports.PerfilSchema = new mongoose_2.Schema({
    name: { type: String, unique: true },
    createdAt: Date,
    permisos: [{
            type: mongoose_2.Schema.Types.ObjectId,
            ref: 'Permiso'
        }]
});
exports.PerfilModel = mongoose_1.default.model("Perfil", exports.PerfilSchema);
