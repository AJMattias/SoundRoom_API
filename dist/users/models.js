"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.UserSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
/**
 *  Definicion de la "tabla" en Mongoose de  User.  No queremos hacer nada raro con ella, simplemente define los tipos de los campos.
 *  No nos interesa añadir lógica de negocio (por ejemplo validar campos) acá, porque eso sería acoplar las responsabilidades de una clase
 *  que sólo debe encargarse de persistencia. Tampoco hay que meter búsquedas de BBDD ni nada parecido en los schemas.
 *
 */
exports.UserSchema = new mongoose_2.Schema({
    name: String,
    email: { type: String, unique: true },
    lastName: String,
    password: String,
    createdAt: Date,
    deletedAt: Date,
    imageId: mongoose_2.Schema.Types.ObjectId,
    isAdmin: Boolean,
    enabled: String,
    userType: String,
    tipoArtista: String,
    idPerfil: {
        type: mongoose_2.Schema.Types.ObjectId,
        ref: "Perfil",
        required: false,
    },
    idArtistType: {
        type: mongoose_2.Schema.Types.ObjectId,
        ref: "ArtistStyle",
    },
    idArtistStyle: {
        type: mongoose_2.Schema.Types.ObjectId,
        ref: "ArtistType",
    },
    estadoUsuario: [{
            type: mongoose_2.Schema.Types.ObjectId,
            ref: 'EstadoUsuario'
        }],
    idSalaDeEnsayo: [{
            type: mongoose_2.Schema.Types.ObjectId,
            ref: 'Sala_De_Ensayo'
        }],
    opiniones: [{
            type: mongoose_2.Schema.Types.ObjectId,
            ref: "Opinion"
        }],
    //agregar dateFrom and dateTo or dateUntil asi tener un historial del estado
    enabledHistory: [{
            status: String,
            dateFrom: Date,
            dateTo: Date
        }],
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }, // Fecha de expiración se guarda como Date
});
exports.UserModel = mongoose_1.default.model("User", exports.UserSchema);
