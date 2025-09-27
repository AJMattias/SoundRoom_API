"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalityModel = exports.ProvinceModel = exports.LocalitySchema = exports.ProvinceSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
/**
 *  Definicion de la "tabla" en Mongoose de  User.  No queremos hacer nada raro con ella, simplemente define los tipos de los campos.
 *  No nos interesa a�adir l�gica de negocio (por ejemplo validar campos) ac�, porque eso ser�a acoplar las responsabilidades de una clase
 *  que s�lo debe encargarse de persistencia. Tampoco hay que meter b�squedas de BBDD ni nada parecido en los schemas.
 *
 */
exports.ProvinceSchema = new mongoose_2.Schema({
    nameProvince: {
        type: String,
        unique: true,
        required: true,
    },
    id: {
        type: mongoose_2.Schema.Types.ObjectId,
    },
});
exports.LocalitySchema = new mongoose_2.Schema({
    nameLocality: {
        type: String,
        unique: true,
        required: true,
    },
    id: {
        type: mongoose_2.Schema.Types.ObjectId,
    },
});
exports.ProvinceModel = mongoose_1.default.model("Province", exports.ProvinceSchema);
exports.LocalityModel = mongoose_1.default.model("Locality", exports.LocalitySchema);
