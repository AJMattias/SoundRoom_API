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
exports.instance = exports.ArtistService = void 0;
const dao = __importStar(require("./dao"));
class ArtistService {
    constructor(ArtistDao) {
        this.dao = ArtistDao;
    }
    /***
     * Guarda una localidad en la base de datos y retorna la localidad creada
     * TODO : validar
     */
    async createArtistStyle(dto) {
        return this.mapToDtoL(await this.dao.storeL({
            nameArtistStyle: dto.nameArtistStyle,
            id: dto.id,
            idArtistType: dto.idArtistType
        }));
    }
    /**
     * Busca a una localidad a partir de una ID.
     * Tira un ModelNotFoundException si no encuentra a la Entidad
     * @param id {string} la id  del usuario a buscar
     * @returns {ArtistStyleDto} el usuario encontrado.
     * @throws {ModelNotFoundException}
     */
    async findArtistStyleById(id) {
        const artistStyle = await this.dao.findByIdL(id);
        return this.mapToDtoL(artistStyle);
    }
    async getAllArtistStyles() {
        const artistStyle = await this.dao.getAllArtistStyles();
        return artistStyle.map((artistStyle) => {
            return this.mapToDtoL(artistStyle);
        });
    }
    mapToDtoL(artistStyle) {
        return {
            nameArtistStyle: artistStyle.nameArtistStyle,
            id: artistStyle.id,
            idArtistType: artistStyle.idArtistType,
        };
    }
    //para la parte de provincias
    async createArtistType(dto) {
        return this.mapToDtoP(await this.dao.storeP({
            nameArtistType: dto.nameArtistType,
            id: dto.id
        }));
    }
    /**
     * Busca a un usuario a partir de una ID.
     * Tira un ModelNotFoundException si no encuentra a la Entidad
     * @param id {string} la id  del usuario a buscar
     * @returns {ArtistTypeDto} el usuario encontrado.
     * @throws {ModelNotFoundException}
     */
    async findArtistTypeById(id) {
        const artistType = await this.dao.findByIdP(id);
        return this.mapToDtoP(artistType);
    }
    async getAllArtistTypes() {
        const artistType = await this.dao.getAllArtistTypes();
        return artistType.map((artistType) => {
            return this.mapToDtoP(artistType);
        });
    }
    mapToDtoP(artistType) {
        return {
            nameArtistType: artistType.nameArtistType,
            id: artistType.id,
        };
    }
}
exports.ArtistService = ArtistService;
exports.instance = new ArtistService(dao.instance);
