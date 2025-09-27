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
exports.instance = exports.LocationService = void 0;
const dao = __importStar(require("./dao"));
class LocationService {
    constructor(LocationDao) {
        this.dao = LocationDao;
    }
    /***
     * Guarda una localidad en la base de datos y retorna la localidad creada
     * TODO : validar
     */
    async createLocality(dto) {
        return this.mapToDtoL(await this.dao.storeL({
            nameLocality: dto.nameLocality,
            idProvince: dto.idProvince
        }));
    }
    async updateLocality(id, dto) {
        return this.mapToDtoL(await this.dao.updateL(id, {
            nameLocality: dto.nameLocality,
            idProvince: dto.idProvince
        }));
    }
    /**
     * Busca a una localidad a partir de una ID.
     * Tira un ModelNotFoundException si no encuentra a la Entidad
     * @param id {string} la id  del usuario a buscar
     * @returns {LocalityDto} el usuario encontrado.
     * @throws {ModelNotFoundException}
     */
    async findLocalityById(id) {
        const locality = await this.dao.findByIdL(id);
        return this.mapToDtoL(locality);
    }
    async getAllLocalities() {
        const locality = await this.dao.getAllLocalities();
        return locality.map((locality) => {
            return this.mapToDtoL(locality);
        });
    }
    mapToDtoL(locality) {
        return {
            nameLocality: locality.nameLocality,
            idProvince: locality.idProvince,
        };
    }
    //para la parte de provincias
    async createProvince(dto) {
        return this.mapToDtoP(await this.dao.storeP({
            nameProvince: dto.nameProvince,
        }));
    }
    /**
     * Busca a un usuario a partir de una ID.
     * Tira un ModelNotFoundException si no encuentra a la Entidad
     * @param id {string} la id  del usuario a buscar
     * @returns {ProvinceDto} el usuario encontrado.
     * @throws {ModelNotFoundException}
     */
    async findProvinceById(id) {
        const province = await this.dao.findByIdP(id);
        return this.mapToDtoP(province);
    }
    async getAllProvinces() {
        const province = await this.dao.getAllProvinces();
        return province.map((province) => {
            return this.mapToDtoP(province);
        });
    }
    mapToDtoP(province) {
        return {
            nameProvince: province.nameProvince,
        };
    }
}
exports.LocationService = LocationService;
exports.instance = new LocationService(dao.instance);
