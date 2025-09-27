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
Object.defineProperty(exports, "__esModule", { value: true });
exports.instance = exports.ConfiguracionService = void 0;
const dao = __importStar(require("./dao"));
class ConfiguracionService {
    constructor(configuracionDao) {
        this.dao = configuracionDao;
    }
    async createConfiguracion(dto) {
        return this.mapToDto(await this.dao.store({
            tiempoBloqueo: dto.tiempoBloqueo,
            maximoIntentos: dto.maximoIntentos,
            porcentajeComision: dto.porcentajeComision,
            createdAt: new Date(),
            deletedAt: new Date()
        }));
    }
    async findConfiguracionById(id) {
        const configuracion = await this.dao.findById(id);
        return this.mapToDto(configuracion);
    }
    async deleteConfiguracionById(id) {
        const configuracion = await this.dao.deleteById(id);
        return this.mapToDto(configuracion);
    }
    async getAllConfiguraciones() {
        const configuraciones = await this.dao.getAll();
        return configuraciones.map((configuraciones) => {
            return this.mapToDto(configuraciones);
        });
    }
    async updateConfiguracion(userId, dto) {
        return this.mapToDto(await this.dao.updateConfiguracion(userId, {
            tiempoBloqueo: dto.tiempoBloqueo,
            maximoIntentos: dto.maximoIntentos,
            porcentajeComision: dto.porcentajeComision,
            createdAt: new Date(),
            deletedAt: new Date()
        }));
    }
    mapToDto(configuracion) {
        return {
            tiempoBloqueo: Number(configuracion.tiempoBloqueo),
            maximoIntentos: configuracion.maximoIntentos,
            porcentajeComision: configuracion.porcentajeComision,
            createdAt: configuracion.createdAt,
            deletedAt: configuracion.deletedAt
        };
    }
}
exports.ConfiguracionService = ConfiguracionService;
exports.instance = new ConfiguracionService(dao.instance);
