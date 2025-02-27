import * as service from "./service";
import * as validator from "express-validator";
import { run } from "../common/utils/run";
import { Application, Request, Response } from "express";
import { ConfiguracionDto } from "./dto";
import { ErrorCode } from "../common/utils/constants";
import { ValidatorUtils } from "../common/utils/validator_utils";
require('dotenv').config();
//nuevas importaciones fix bugs
import path from 'path';
import { spawn } from 'child_process';
import fs from 'fs';
import { admin, auth } from "../server/middleware";


/**
*
* @param {Express} app 
*/

export const route = (app: Application) => {

    app.get("/configuraciones/", run(async (req: Request, resp: Response) => {
        const configuraciones: ConfiguracionDto[] = await service.instance.getAllConfiguraciones()
        resp.json(configuraciones)
    }))

    app.get("/configuraciones/:id", run(async (req: Request, resp: Response) => {
        const configuraciones: ConfiguracionDto = await service.instance.findConfiguracionById(`id`)
        resp.json(configuraciones)
    }))

    app.post("/configuraciones/",
        validator.body("tiempoBloqueo").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("maximoIntentos").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("porcentajeComision").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),

        run(async (req: Request, resp: Response) => {
            const error = validator.validationResult(req)
            if (error && !error.isEmpty()) {
                throw ValidatorUtils.toArgumentsException(error.array())
            }
            const dto = req.body
            const configuracion = await service.instance.createConfiguracion({
                tiempoBloqueo: dto["tiempoBloqueo"],
                maximoIntentos: dto["maximoIntentos"],
                porcentajeComision: dto["porcentajeComision"]
            })
            resp.json(configuracion)
        })
    )
    //Para la modificacion, traigo la configuracion inicial para ver que ha cambiado y que no sobrescriba las cosas a null
    app.put("/configuraciones/",
        validator.query("id").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        run(async (req: Request, resp: Response) => {
            const errors = validator.validationResult(req)
            if (errors && !errors.isEmpty()) {
                throw ValidatorUtils.toArgumentsException(errors.array())
            }
            const dto = req.body
            const id = req.query.id as string
            const ConfOriginal: ConfiguracionDto = await service.instance.findConfiguracionById(id)
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
            })
            resp.json(configuracion)
        })
    )

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
    app.put("/configuraciones/backup",
        auth, admin,
        run(async (req: Request, resp: Response) => {
        const today = new Date()
        const day = today.getDate()
        const motnh = today.getMonth()+1
        const year = today.getFullYear()
        const miliseconds = today.getTime()
        const nombre = `backup-${day}${motnh}${year}${miliseconds}.bson`;
        console.log('nombre: ', nombre)
        const rutaArchivo = path.join(__dirname, '..', nombre);  // Construir la ruta correcta para el archivo
        console.log('ruta path: ', rutaArchivo)
        const rutaDump = process.env.MONGODUMP;
    
        // Verifica que `rutaDump` esté correctamente definida.
        if (!rutaDump) {
            return resp.status(500).send("Error: MONGODUMP no está configurado");
        }
    
        let backupProcess = spawn(rutaDump, [
            '--db=sound_room',
            '--archive=' + rutaArchivo,
            //'--gzip' // Agrega --gzip si deseas comprimir el archivo de respaldo
        ]);
    
        // Escuchar eventos de proceso
        backupProcess.on('close', (code) => {
            if (code === 0) {
                console.log('Backup creado exitosamente.');
    
                // Verifica si el archivo existe antes de enviarlo
                if (fs.existsSync(rutaArchivo)) {
                    resp.download(rutaArchivo, nombre, (err) => {
                        if (err) {
                            console.error('Error enviando el archivo:', err);
                            resp.status(500).send("Error al descargar el archivo");
                        } else {
                            console.log('Archivo enviado:', nombre);
                            console.log('ruta: ', rutaArchivo)
                        }
                    });
                } else {
                    console.error('Archivo no encontrado:', rutaArchivo);
                    resp.status(404).send("Archivo no encontrado");
                }
            } else {
                console.error('Proceso de backup fallido con código:', code);
                resp.status(500).send("Error al crear el backup");
            }
        });
        backupProcess.on('error', (err) => {
            console.error('Error al iniciar el proceso de backup:', err);
            resp.status(500).send("Error al iniciar el proceso de backup");
        });
    }));


    app.put("/configuraciones/backupLoad",
        run(async (req: Request, resp: Response) => {

            const spawn = require('child_process').spawn
            const rutaDump = process.env.MONGORESTORE
            let backupProcess = spawn(rutaDump, [
                '--db=sound_room',
                //Cambiar disco D por E(mio AJM)
                '--archive=E:/kk',
                '--gzip'
            ]);
        }))

    app.put("/configuraciones/delete/:id", 
        validator.query("id").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        
        run (async(req: Request, resp: Response) => {
            const id = req.query.id as string
            const configuraciones : ConfiguracionDto = await service.instance.deleteConfiguracionById(id)
        resp.json(configuraciones)
    }))
}