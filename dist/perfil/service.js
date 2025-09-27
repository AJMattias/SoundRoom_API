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
exports.instance = exports.PerfilService = void 0;
const dao = __importStar(require("./dao"));
class PerfilService {
    constructor(perfilDao) {
        this.dao = perfilDao;
    }
    async createPerfil(dto) {
        return this.mapToDto(await this.dao.store({
            name: dto.name,
            createdAt: new Date()
        }));
    }
    async findPerfilById(id) {
        const perfil = await this.dao.findPerfilById(id);
        return this.mapToDto(perfil);
    }
    async getAllPerfiles() {
        const perfiles = await this.dao.getAllPerfils();
        return perfiles.map((perfiles) => {
            return this.mapToDto(perfiles);
        });
    }
    // UpdatePerfil not only to update perfil name, also to add new permisos
    async updatePerfil(id, dto) {
        return this.mapToDto(await this.dao.updatePerfil(id, {
            name: dto.name,
            createdAt: new Date(),
            permisos: dto.permisos
        }));
    }
    async addPermisoToPerfil(id, permisos) {
        console.log('servicio perfil - add permisos to perfil - id, permisos: ', id, permisos);
        return this.mapToDto(await this.dao.addPermisosToPerfil(id, permisos));
    }
    async deletePermisoFromPerfil(id, dto) {
        return this.mapToDto(await this.dao.deletePermisoFromProfile(id, {
            name: dto.name,
            createdAt: new Date(),
            permisos: dto.permisos
        }));
    }
    async deletePerfil(id) {
        return this.mapToDto(await this.dao.deletePerfil(id));
    }
    mapToDto(perfil) {
        return {
            name: perfil.name,
            id: perfil.id,
            permisos: perfil.permisos,
        };
    }
    // Para Permisos
    mapToDtoP(permiso) {
        return {
            id: permiso.id,
            name: permiso.name,
            enabled: permiso.enabled
        };
    }
    async createPermiso(dtoPermiso) {
        return this.mapToDtoP(await this.dao.storePermiso({
            name: dtoPermiso.name,
            createdAt: new Date(),
            enabled: "true"
        }));
    }
    async getAllPermisos() {
        const permiso = await this.dao.getAllPermisos();
        return permiso.map((permiso) => {
            return this.mapToDtoP(permiso);
        });
    }
    async getAllPermisosDisabled() {
        const permiso = await this.dao.getAllPermisosDisabled();
        return permiso.map((permiso) => {
            return this.mapToDtoP(permiso);
        });
    }
    async findPermisoById(id) {
        const permiso = await this.dao.findPermisoById(id);
        return this.mapToDtoP(permiso);
    }
    async updatePermiso(id, dto) {
        return this.mapToDtoP(await this.dao.updatePermiso(id, {
            name: dto.name,
            createdAt: new Date(),
            enabled: "true",
        }));
    }
    async deletePermiso(id) {
        // return this.mapToDtoP(
        //     await this.dao.deletePermiso(id)
        // , {
        //     name: dto.name,
        //     deletedAt: new Date(),
        //     enabled:false,
        // }
        //)
        return await this.dao.deletePermiso(id);
    }
}
exports.PerfilService = PerfilService;
exports.instance = new PerfilService(dao.instance);
