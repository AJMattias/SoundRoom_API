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
exports.checkArtistOrSalaDeEnsayo = exports.checkPermission = exports.validarDiaSemana = exports.admin = exports.auth = exports.quota = exports.defaultRateLimiter = exports.middleware = void 0;
//import * as dotenv from "dotenv"
const express = __importStar(require("express"));
const jwt = __importStar(require("jsonwebtoken"));
const exception_1 = require("../common/exception/exception");
const rateLimiter = __importStar(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const exception_js_1 = require("../common/exception/exception.js");
const models_1 = require("../users/models");
const models_2 = require("../perfil/models");
// Update the path below to the correct location of DiasSemana
const model_1 = require("../sala_de_ensayo/model");
// or, if the correct file is elsewhere, adjust accordingly, e.g.:
// import { DiasSemana } from "../models/sala_de_ensayo"
// Make sure the file exists and exports DiasSemana
const cors = require("cors");
/**
 *  Acá se configuran todos los middleware globales de nuestra app.
 *  @param {Express} app
 */
const middleware = (app) => {
    app.use(express.json());
    app.use(defaultRateLimiter());
    app.use((0, helmet_1.default)()); //Varias configuraciones de seguridad
    app.use(cors());
};
exports.middleware = middleware;
/**
 *  Rate limiter:  Limitamos la cantidad de requests que un usuario puede realizar por minuto.
 */
function defaultRateLimiter() {
    const windowTime = process.env.MAX_REQUEST_WINDOW ? parseInt(process.env.MAX_REQUEST_WINDOW) : 1;
    const maxTimes = process.env.MAX_REQUEST_NUMBER ? parseInt(process.env.MAX_REQUEST_NUMBER) : 100;
    return rateLimiter.default({
        windowMs: windowTime * 1000,
        max: maxTimes,
        handler: (req, res) => {
            console.log(`ApiQuota exceeded for ip ${req.connection.remoteAddress}`);
            throw new exception_js_1.ApiQuotaException(60000);
        }
    });
}
exports.defaultRateLimiter = defaultRateLimiter;
/**
 * Devuelve un middleware para limitar ciertas rutas con un menor nro de requests por minuto permitidas.
 * @param {Int} maxRequests
 * @returns {rateLimiter.RateLimit}
 */
const quota = (maxRequests) => {
    const windowTime = process.env.MAX_REQUEST_WINDOW ? parseInt(process.env.MAX_REQUEST_WINDOW) : 1;
    return rateLimiter.default({
        windowMs: windowTime * 1000,
        max: maxRequests,
        handler: (req, res) => {
            console.log(`ApiQuota exceeded for ip ${req.connection.remoteAddress}`);
            throw new exception_js_1.ApiQuotaException(60000);
        }
    });
};
exports.quota = quota;
const auth = function (req, resp, next) {
    var token = req.header("Authorization");
    if (!token) {
        console.error("Emtpy token");
        return (new exception_1.AuthenticationException()).send(resp);
    }
    token = token.replace("Bearer ", "");
    const jwtKey = process.env.JWT_KEY;
    if (!jwtKey) {
        const err = new exception_1.ServerException();
        return err.send(resp);
    }
    try {
        const decoded = jwt.verify(token, jwtKey);
        req.user = decoded;
        next();
    }
    catch (error) {
        return (new exception_1.AuthenticationException()).send(resp);
    }
};
exports.auth = auth;
const admin = function (req, resp, next) {
    const user = req.user;
    if (user && user.isAdmin) {
        next();
    }
    else {
        return (new exception_1.AuthorizationException()).send(resp);
    }
};
exports.admin = admin;
// // src/middlewares/validarDiaSemana.ts
// import { Request, Response, NextFunction } from 'express';
// import { DiasSemana } from '../models/model'; // ajustá la ruta según tu estructura
// /**
//  * Valida que cada elemento de req.body.horarios incluya
//  * un `dia` perteneciente al enum DiasSemana.
//  * Si la validación falla, responde 400 con un mensaje descriptivo.
//  */
const validarDiaSemana = (req, res, next) => {
    const { horarios } = req.body;
    if (!horarios || !Array.isArray(horarios)) {
        return res
            .status(400)
            .json({ message: '`horarios` debe ser un array de objetos.' });
    }
    for (const [index, horario] of horarios.entries()) {
        const { dia } = horario;
        if (!dia || typeof dia !== 'string') {
            return res
                .status(400)
                .json({ message: `horarios[${index}].dia es requerido y debe ser string.` });
        }
        // Verificamos que el valor de dia esté dentro del enum
        if (!Object.values(model_1.DiasSemana).includes(dia)) {
            return res.status(400).json({
                message: `El día "${dia}" no es válido. Los días permitidos son: ${Object.values(model_1.DiasSemana).join(', ')}.`,
            });
        }
    }
    // Todo ok, continuamos con el siguiente middleware o controlador
    return next();
};
exports.validarDiaSemana = validarDiaSemana;
//se llama con checkPermission(['CREAR_SALA_DE_ENSAYO']), // Verificación de permisos
const checkPermission = (requiredPermisos) => {
    return async (req, resp, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return resp.status(401).json({ message: 'Acceso no autorizado' });
            }
            const secretKey = process.env.JWT_KEY;
            if (!secretKey) {
                console.error("empty jwtKey");
                const err = new exception_1.ServerException();
                return err.send(resp);
            }
            // Verificar y decodificar el token
            const decoded = jwt.verify(token, secretKey);
            req.user = decoded;
            //isAdmin?
            const userAdmin = req.user;
            if (userAdmin && userAdmin.isAdmin) {
                next();
                // } else {
                // return (new AuthorizationException()).send(resp)
            }
            // Obtener el perfil del usuario
            const user = await models_1.UserModel.findById(req.user.id).populate('idPerfil');
            if (!user) {
                return resp.status(404).json({ message: 'Usuario no encontrado' });
            }
            //TODO: verificar si es admin no buscar perfil
            if (user.isAdmin === false) {
                const perfil = await models_2.PerfilModel.findById(user.idPerfil).populate('permisos');
                if (!perfil) {
                    return resp.status(404).json({ message: 'Perfil no encontrado' });
                }
                // Filtrar permisos habilitados y extraer los nombres de permisos
                const userPermisos = perfil.permisos
                    ?.filter((permiso) => permiso.enabled === 'true') // Solo permisos habilitados
                    .map((permiso) => permiso.name.toUpperCase().replace(/ /g, '_')) || [];
                // Normalizar los permisos requeridos
                const normalizedRequiredPermisos = requiredPermisos.map(permiso => permiso.toUpperCase().replace(/ /g, '_'));
                // Verificar si el usuario tiene los permisos requeridos
                //const hasPermission = requiredPermisos.every(permiso => userPermisos.includes(permiso));
                const hasPermission = normalizedRequiredPermisos.every(permiso => userPermisos.includes(permiso));
                if (!hasPermission) {
                    return resp.status(403).json({ message: 'No tienes los permisos necesarios' });
                }
                // Si tiene permisos, continuar con la siguiente función middleware o controlador
                next();
            }
        }
        catch (error) {
            console.error(error);
            resp.status(500).json({ message: 'Error del servidor' });
        }
    };
};
exports.checkPermission = checkPermission;
// el perfil es artista o sala de ensayo: para crear sala de ensayo:
const checkArtistOrSalaDeEnsayo = async (req, res, next) => {
    try {
        const user = req.user; // Usuario decodificado del token
        if (!user || !user.idPerfil) {
            return res.status(403).json({ message: "Acceso denegado: Usuario no autenticado o sin perfil" });
        }
        const perfil = await models_2.PerfilModel.findById(user.idPerfil).exec();
        if (!perfil) {
            return res.status(403).json({ message: "Acceso denegado: Perfil no encontrado" });
        }
        const validProfiles = ["Artista", "Sala de Ensayo"];
        if (validProfiles.includes(perfil.name)) {
            next();
        }
        else {
            return res.status(403).json({ message: "Acceso denegado: Perfil no autorizado" });
        }
    }
    catch (error) {
        console.error("Error en checkArtistOrSalaDeEnsayo:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
exports.checkArtistOrSalaDeEnsayo = checkArtistOrSalaDeEnsayo;
