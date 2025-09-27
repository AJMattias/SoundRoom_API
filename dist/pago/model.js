"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagoModel = exports.PagoSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
exports.PagoSchema = new mongoose_2.Schema({
    createdAt: Date,
    name: String,
    ccv: String,
    numeroTarjeta: String,
    fechaVencimiento: String,
    idUser: { type: mongoose_2.Schema.Types.ObjectId,
        ref: "User" },
    idSala: { type: mongoose_2.Schema.Types.ObjectId,
        ref: "User" },
    idReservation: { type: mongoose_2.Schema.Types.ObjectId,
        ref: "Reservation" },
});
exports.PagoModel = mongoose_1.default.model("Pago", exports.PagoSchema);
