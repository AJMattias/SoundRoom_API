"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpinionDto = exports.SalaDeEnsayoDto = void 0;
class SalaDeEnsayoDto {
    constructor(sala) {
        this.id = sala.id;
        this.nameSalaEnsayo = sala.nameSalaEnsayo;
        this.calleDireccion = sala.calleDireccion;
        this.numeroDireccion = sala.numeroDireccion;
        this.duracionTurno = sala.duracionTurno;
        this.precioHora = sala.precioHora;
        this.imagenes = sala.imagenes;
        this.idOwner = sala.idOwner;
        this.idType = sala.idType;
        this.idLocality = sala.idLocality;
        this.createdAt = sala.createdAt;
        this.descripcion = sala.descripcion;
        this.comodidades = sala.comodidades;
        this.opiniones = sala.opiniones;
        this.enabled = sala.enabled;
        this.enabledHistory = sala.enabledHistory;
        this.horarios = sala.horarios;
    }
}
exports.SalaDeEnsayoDto = SalaDeEnsayoDto;
class OpinionDto {
    constructor(opinion) {
        this.id = opinion.id,
            this.descripcion = opinion.descripcion,
            this.estrellas = opinion.estrellas,
            this.idUser = opinion.idUser,
            this.idRoom = opinion.idRoom,
            this.idArtist = opinion.idArtist;
    }
}
exports.OpinionDto = OpinionDto;
