"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = void 0;
// src/config/cloudinaryConfig.ts
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
const dotenv_1 = __importDefault(require("dotenv")); // Importa dotenv aquí también si este archivo es el que accede a .env
// Asegúrate de cargar las variables de entorno si este es el primer lugar
// donde se usan o si no estás seguro de que server.ts las cargue antes de importar esto.
// Aunque lo ideal es que dotenv.config() esté en server.ts al inicio.
dotenv_1.default.config(); // Puedes ponerlo aquí como respaldo, pero preferiblemente en server.ts
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});
