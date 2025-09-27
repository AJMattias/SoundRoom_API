"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermisoModel = exports.PermisoSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
exports.PermisoSchema = new mongoose_2.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
    },
    createdAt: Date,
    deletedAt: Date,
    enabled: String,
});
exports.PermisoModel = mongoose_1.default.model("Permiso", exports.PermisoSchema);
