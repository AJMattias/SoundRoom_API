"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfiguracionDto = void 0;
class ConfiguracionDto {
    constructor(configuracion) {
        this.tiempoBloqueo = configuracion.tiempoBloqueo;
        this.maximoIntentos = configuracion.maximoIntentos;
        this.porcentajeComision = configuracion.porcentajeComision;
        this.createdAt = configuracion.createdAt;
        this.deletedAt = configuracion.deletedAt;
    }
}
exports.ConfiguracionDto = ConfiguracionDto;
