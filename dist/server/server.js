"use strict";
// import fileUpload from "express-fileupload"
// import * as db from "../database/db.js"
// import * as express from "express"
// const routes = require("./routes.js")
// const middleware = require("./middleware")
// const handler  = require("../common/exception/handler.js")
// import multer from 'multer'
// import path from "path";
// import cors from "cors";
// import * as dotenv from "dotenv";
// import imageRouter from "../imagen/routes.js"; // <--- Import the default exported router
// import { route } from "./routes.js"
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
exports.SoundRoomsServer = void 0;
// dotenv.config();
// console.log('--- VERIFICACIÓN DE VARIABLES DE ENTORNO DE CLOUDINARY ---');
// console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUD_NAME);
// console.log('CLOUDINARY_API_KEY:', process.env.API_KEY ? '***** (cargada)' : 'NO DEFINIDA'); // Oculta el valor real
// console.log('CLOUDINARY_API_SECRET:', process.env.API_SECRET ? '***** (cargada)' : 'NO DEFINIDA'); // Oculta el valor real
// console.log('----------------------------------------------------');
// /**
//      *  Clase maestra  de nuestra aplicación. Va  a tener toda la lógica  de inicialización de servidor,
//      *  conectarse a la BBDD, setear los middleware , etc.  
//      * 
//      *  @param {Express} app
//      *  
//      */
// export class SoundRoomsServer {
//     _app : express.Application;
//     constructor (app: express.Application){
//         this._app = app
//     }
//     /**
//      *  Inicia nuestra app , se conecta con Mongo y Redis y carga las rutas.
//      *  @param {Int} port
//      */
//     start(port: number) {
//         this._startEngines()
//        .then(() => {
//            this._app.set('trust proxy', true)
//             middleware.middleware(this._app)
//             // this._app.use(fileUpload({
//             //     useTempFiles: true,
//             //     tempFileDir: '/tmp/',
//             //     createParentPath: true,
//             //     limits: {
//             //         fileSize:10000000 //10mb
//             //     }
//             // }))
//             const allowedOrigins = [
//                 'http://localhost:5173' // Si es en desarrollo
//                 // Agrega tu dominio de producción aquí
//                 //'https://tu-frontend-en-produccion.com' 
//             ];
//             this._app.use(cors({
//                 origin: allowedOrigins,  // Permitir solo estos orígenes
//                 methods: ['GET', 'POST', 'PUT', 'DELETE'],
//                 allowedHeaders: ['Content-Type', 'Authorization']
//             }));
//             this._app.use('/uploads', express.static(path.resolve('uploads')))
//             console.log('Serving static files from:', path.join('C:/Users/matti/Desktop/soundroom_final/pdf_soundroom'));
//             this._app.use('/pdfs', express.static(path.join('C:/Users/matti/Desktop/soundroom_final/pdf_soundroom/pdfs')));
//             this._app.use('/image', imageRouter); 
//             this._app.use(express.json());
//             this._app.use(express.urlencoded({extended: true}))
//             routes.route(this._app)
//             handler.handle(this._app)
//             // esta carpeta sera usada para almacenar  archivos publicos
//             this._app.use('/uploads', express.static(path.resolve('uploads')));
//             // this._app.listen(port)
//             // console.log("App started successfully")
//             this._app.listen(port, () => {
//                 console.log(`App started successfully on port ${port}`);
//             });
//         })
//         .catch((error) => {
//             console.error("Error initialazing the app")
//             console.error(error)
//             process.exit(1)
//         })
//     }
//     /**
//      *  Todo lo que necesitemos inicializar para que el sistema funcione (por ejemplo , connectarnos a la base de datos o redis)
//      *  va acá.
//      */
//     async _startEngines() : Promise<void> {
//        return await db.connect()
//     }
// }
// server.ts
// ... (todas tus importaciones) ...
const express = __importStar(require("express")); // Asegúrate que esta importación sea correcta si usas 'export default app'
const middleware = require("./middleware");
const cors_1 = __importDefault(require("cors"));
const routes_js_1 = require("./routes.js");
//const routes = require("./routes.js")
const handler = require("../common/exception/handler.js");
const db = __importStar(require("../database/db.js"));
// ... (Toda la lógica de logs de Cloudinary, etc.) ...
class SoundRoomsServer {
    constructor(app) {
        this._app = app;
    }
    async getApp() {
        try {
            await this._startEngines();
            this._app.set('trust proxy', true);
            // CORS configuration
            this._app.use((0, cors_1.default)({
                origin: 'http://localhost:5173',
                credentials: true,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                allowedHeaders: ['Content-Type', 'Authorization']
            }));
            // Log específico para /auth
            this._app.options('*', (req, res) => {
                res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
                res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
                res.status(200).send();
            });
            middleware.middleware(this._app);
            this._app.use(express.json());
            this._app.use(express.urlencoded({ extended: true }));
            (0, routes_js_1.routes)(this._app);
            handler.handle(this._app);
            return this._app;
        }
        catch (error) {
            console.error("Error initializing the app:", error);
            throw error;
        }
    }
    // ... (Tu método _startEngines es correcto) ...
    async _startEngines() {
        return await db.connect();
    }
}
exports.SoundRoomsServer = SoundRoomsServer;
