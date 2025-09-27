"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpinionModel = exports.OpinionSchema = exports.SalaDeEnsayoModel = exports.SalaDeEnsayoSchema = exports.enabledHistoy = exports.DiasSemana = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
var DiasSemana;
(function (DiasSemana) {
    DiasSemana["Lunes"] = "Lunes";
    DiasSemana["Martes"] = "Martes";
    DiasSemana["Miercoles"] = "Mi\u00E9rcoles";
    DiasSemana["Jueves"] = "Jueves";
    DiasSemana["Viernes"] = "Viernes";
    DiasSemana["Sabado"] = "S\u00E1bado";
    DiasSemana["Domingo"] = "Domingo";
})(DiasSemana = exports.DiasSemana || (exports.DiasSemana = {}));
exports.enabledHistoy = new mongoose_2.Schema({
    status: String,
    dateFrom: Date,
    dateTo: Date
});
exports.SalaDeEnsayoSchema = new mongoose_2.Schema({
    nameSalaEnsayo: { type: String, unique: true },
    calleDireccion: String,
    numeroDireccion: Number,
    precioHora: Number,
    duracionTurno: Number,
    createdAt: Date,
    enabled: String,
    comodidades: { type: [String] },
    descripcion: {
        type: String,
        maxlength: 300
    },
    imagenes: [{
            type: [mongoose_2.Schema.Types.ObjectId],
            ref: "Imagen",
            default: []
        }],
    idOwner: {
        type: mongoose_2.Schema.Types.ObjectId,
        ref: "User",
    },
    idLocality: {
        type: mongoose_2.Schema.Types.ObjectId,
        ref: "Locality",
    },
    idType: {
        type: mongoose_2.Schema.Types.ObjectId,
        ref: "Type",
    },
    opiniones: [{
            type: mongoose_2.Schema.Types.ObjectId,
            ref: "Opinion"
        }],
    enabledHistory: [{
            status: String,
            dateFrom: Date,
            dateTo: Date
        }],
    horarios: [{
            dia: { type: String, required: true },
            hsInicio: { type: String, required: true },
            hsFin: { type: String, required: true },
            available: { type: Boolean, default: true }
        }]
});
// index for another search room call to db
//SalaDeEnsayoSchema.index({ nameSalaEnsayo: 'text' });
exports.SalaDeEnsayoModel = mongoose_1.default.model("Sala_De_Ensayo", exports.SalaDeEnsayoSchema);
exports.OpinionSchema = new mongoose_2.Schema({
    descripcion: {
        type: String,
        maxlength: 300
    },
    estrellas: {
        type: Number
    },
    createdAt: Date,
    idUser: {
        type: mongoose_2.Schema.Types.ObjectId,
        ref: "User",
    },
    //nuevo diseño de documento ahora opinion tiene la sala a la que pertenece
    idRoom: {
        type: mongoose_2.Schema.Types.ObjectId,
        ref: "Sala_De_Ensayo",
    },
    idArtist: {
        type: mongoose_2.Schema.Types.ObjectId,
        ref: "User",
    }
});
exports.OpinionModel = mongoose_1.default.model("Opinion", exports.OpinionSchema);
