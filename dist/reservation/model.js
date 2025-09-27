"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationModel = exports.ReservationSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
exports.ReservationSchema = new mongoose_2.Schema({
    createdAt: Date,
    deletedAt: Date,
    hsStart: String,
    hsEnd: String,
    date: Date,
    totalPrice: Number,
    canceled: String,
    canceledDate: Date,
    //TODO agregar canceledDate: Date. Idem a docs, reservation, y dtos
    idOwner: { type: mongoose_2.Schema.Types.ObjectId,
        ref: "User" },
    idUser: { type: mongoose_2.Schema.Types.ObjectId,
        ref: "User" },
    idRoom: { type: mongoose_2.Schema.Types.ObjectId,
        ref: "Sala_De_Ensayo" },
});
exports.ReservationModel = mongoose_1.default.model("Reservation", exports.ReservationSchema);
