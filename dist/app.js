"use strict";
// import * as dotenv from "dotenv"
// dotenv.config()
// import express from "express"
// import {SoundRoomsServer} from "./server/server.js"
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const app = express()
// // Si APP_PORT esta definido, parseamos el port number, si no usamos 3000 por defecto
// const port : number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000
// //Logica de error handling y salida forzada del sistema.
// process.on('uncaughtException', (error) =>{
//     console.error("Uncaught fatal exception!!")
//     console.error(error)
// }) 
// const server = new SoundRoomsServer(app)
// server.start(3000)
// app.ts
//vercel version gemini
// import * as dotenv from "dotenv"
// dotenv.config()
// import express from "express"
// import { SoundRoomsServer } from "./server/server" // Asegúrate que la ruta sea correcta
// const app = express()
// // Lógica de error handling (déjala)
// process.on('uncaughtException', (error) => {
//     console.error("Uncaught fatal exception!!")
//     console.error(error)
// }) 
// const server = new SoundRoomsServer(app)
// // Usamos el nuevo método getApp y luego exportamos el resultado.
// // Esto se ejecutará la primera vez que Vercel inicialice la función serverless.
// export default server.getApp()
// /* * Lógica para ejecutar LOCALMENTE (Opcional pero muy útil):
//  * Si quieres mantener tu lógica local con `npm run start`, puedes hacer esto:
//  */
// if (process.env.NODE_ENV !== 'production') {
//     const port: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000
//     server.getApp()
//         .then(app => {
//             app.listen(port, () => {
//                 console.log(`[Local DEV] App started successfully on port ${port}`);
//             })
//         })
//         .catch(error => {
//             console.error('Error starting local server:', error);
//             process.exit(1);
//         });
// }
//vercel version deepseek
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_1 = __importDefault(require("express"));
const server_js_1 = require("./server/server.js");
const app = (0, express_1.default)();
const server = new server_js_1.SoundRoomsServer(app);
// **OPCIÓN 2**
exports.default = server.getApp().then(app => app);
// **SOLO PARA DESARROLLO LOCAL**
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    server.getApp()
        .then(app => {
        app.listen(port, '0.0.0.0', () => {
            console.log(`[Local DEV] Server running on port ${port}`);
        });
    })
        .catch(error => {
        console.error('Failed to start server:', error);
        process.exit(1);
    });
}
