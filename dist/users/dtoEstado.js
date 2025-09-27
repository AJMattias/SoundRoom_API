"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstadoDto = void 0;
class EstadoDto {
    constructor(estado) {
        this.id = estado.id;
        this.createdAt = estado.createdAt;
        this.deletedAt = estado.deletedAt;
        this.estado = estado.estado;
    }
}
exports.EstadoDto = EstadoDto;
