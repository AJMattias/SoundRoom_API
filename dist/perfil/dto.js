"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermisoDto = exports.PerfilPermisoDto = exports.PerfilDto = void 0;
class PerfilDto {
    constructor(perfil) {
        this.name = perfil.name;
        this.id = perfil.id;
        this.permisos = perfil.permisos;
    }
}
exports.PerfilDto = PerfilDto;
class PerfilPermisoDto {
    constructor(perfil) {
        this.name = perfil.name;
        this.id = perfil.id;
        this.permisos = perfil.permisos;
    }
}
exports.PerfilPermisoDto = PerfilPermisoDto;
class PermisoDto {
    constructor(permiso) {
        this.id = permiso.id;
        this.name = permiso.name;
        this.enabled = permiso.enabled;
        //    this.createdAt = permiso.createdAt
    }
}
exports.PermisoDto = PermisoDto;
