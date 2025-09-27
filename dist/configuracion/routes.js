"use strict";
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
exports.route = void 0;
const service = __importStar(require("./service"));
const validator = __importStar(require("express-validator"));
const run_1 = require("../common/utils/run");
const constants_1 = require("../common/utils/constants");
const validator_utils_1 = require("../common/utils/validator_utils");
require('dotenv').config();
//nuevas importaciones fix bugs
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const middleware_1 = require("../server/middleware");
/**
*
* @param {Express} app
*/
const route = (app) => {
    app.get("/configuraciones/", (0, run_1.run)(async (req, resp) => {
        const configuraciones = await service.instance.getAllConfiguraciones();
        resp.json(configuraciones);
    }));
    app.get("/configuraciones/:id", (0, run_1.run)(async (req, resp) => {
        const configuraciones = await service.instance.findConfiguracionById(`id`);
        resp.json(configuraciones);
    }));
    app.post("/configuraciones/", validator.body("tiempoBloqueo").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("maximoIntentos").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("porcentajeComision").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const error = validator.validationResult(req);
        if (error && !error.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(error.array());
        }
        const dto = req.body;
        const configuracion = await service.instance.createConfiguracion({
            tiempoBloqueo: dto["tiempoBloqueo"],
            maximoIntentos: dto["maximoIntentos"],
            porcentajeComision: dto["porcentajeComision"]
        });
        resp.json(configuracion);
    }));
    //Para la modificacion, traigo la configuracion inicial para ver que ha cambiado y que no sobrescriba las cosas a null
    app.put("/configuraciones/", validator.query("id").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const dto = req.body;
        const id = req.query.id;
        const ConfOriginal = await service.instance.findConfiguracionById(id);
        if (!dto["tiempoBloqueo"]) {
            dto["tiempoBloqueo"] = ConfOriginal["tiempoBloqueo"];
        }
        if (!dto["maximoIntentos"]) {
            dto["maximoIntentos"] = ConfOriginal["maximoIntentos"];
        }
        if (!dto["porcentajeComision"]) {
            dto["porcentajeComision"] = ConfOriginal["porcentajeComision"];
        }
        const configuracion = await service.instance.updateConfiguracion(id, {
            tiempoBloqueo: dto["tiempoBloqueo"],
            maximoIntentos: dto["maximoIntentos"],
            porcentajeComision: dto["porcentajeComision"]
        });
        resp.json(configuracion);
    }));
    //ruta backup original
    // app.put("/configuraciones/backup",
    //     run(async (req: Request, resp: Response) => {
    //         let nombre = "backup.bson"
    //         const rutaArchivo = "../" + nombre
    //         const spawn = require('child_process').spawn
    //         const rutaDump = process.env.MONGODUMP
    //         let backupProcess = spawn(rutaDump, [
    //             '--db=sound_room',
    //             '--archive=' + rutaArchivo
    //         ]);
    //         var options = {
    //             root: rutaDump
    //         };
    //         resp.sendFile("Archivo", options, function (err) {
    //             if (err) {
    //                 console.log('Back, error descargando archivo: ', err)
    //             } else {
    //                 console.log('Sent:', nombre);
    //             }
    //         });
    // }))
    //ruta chatgpt idea:
    app.put("/configuraciones/backup", middleware_1.auth, middleware_1.admin, (0, run_1.run)(async (req, resp) => {
        const today = new Date();
        const day = today.getDate();
        const motnh = today.getMonth() + 1;
        const year = today.getFullYear();
        const miliseconds = today.getTime();
        const nombre = `backup-${day}${motnh}${year}${miliseconds}.bson`;
        console.log('nombre: ', nombre);
        const rutaArchivo = path_1.default.join(__dirname, '..', nombre); // Construir la ruta correcta para el archivo
        console.log('ruta path: ', rutaArchivo);
        const rutaDump = process.env.MONGODUMP;
        // Verifica que `rutaDump` esté correctamente definida.
        if (!rutaDump) {
            return resp.status(500).send("Error: MONGODUMP no está configurado");
        }
        let backupProcess = (0, child_process_1.spawn)(rutaDump, [
            '--db=sound_room',
            '--archive=' + rutaArchivo,
            //'--gzip' // Agrega --gzip si deseas comprimir el archivo de respaldo
        ]);
        // Escuchar eventos de proceso
        backupProcess.on('close', (code) => {
            if (code === 0) {
                console.log('Backup creado exitosamente.');
                // Verifica si el archivo existe antes de enviarlo
                if (fs_1.default.existsSync(rutaArchivo)) {
                    resp.download(rutaArchivo, nombre, (err) => {
                        if (err) {
                            console.error('Error enviando el archivo:', err);
                            resp.status(500).send("Error al descargar el archivo");
                        }
                        else {
                            console.log('Archivo enviado:', nombre);
                            console.log('ruta: ', rutaArchivo);
                        }
                    });
                }
                else {
                    console.error('Archivo no encontrado:', rutaArchivo);
                    resp.status(404).send("Archivo no encontrado");
                }
            }
            else {
                console.error('Proceso de backup fallido con código:', code);
                resp.status(500).send("Error al crear el backup");
            }
        });
        backupProcess.on('error', (err) => {
            console.error('Error al iniciar el proceso de backup:', err);
            resp.status(500).send("Error al iniciar el proceso de backup");
        });
    }));
    app.put("/configuraciones/backupLoad", (0, run_1.run)(async (req, resp) => {
        const spawn = require('child_process').spawn;
        const rutaDump = process.env.MONGORESTORE;
        let backupProcess = spawn(rutaDump, [
            '--db=sound_room',
            //Cambiar disco D por E(mio AJM)
            '--archive=E:/kk',
            '--gzip'
        ]);
    }));
    app.put("/configuraciones/delete/:id", validator.query("id").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const id = req.query.id;
        const configuraciones = await service.instance.deleteConfiguracionById(id);
        resp.json(configuraciones);
    }));
};
exports.route = route;
