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
exports.instance = exports.ManagementService = void 0;
const dao = __importStar(require("./dao"));
class ManagementService {
    constructor(managementDao) {
        this.dao = managementDao;
    }
    //Creado de tipo
    async createType(dto) {
        return this.mapToDtoType(await this.dao.storeType({
            name: dto.name,
            createdAt: new Date()
        }));
    }
    async findTypeById(id) {
        const type = await this.dao.findTypeById(id);
        return this.mapToDtoType(type);
    }
    async getAllTypes() {
        const types = await this.dao.getAllTypes();
        console.log('service type sala: ', types);
        return types.map((types) => {
            return this.mapToDtoType(types);
        });
    }
    //creadi de estado de salas de ensayo
    async createStateSalaEnsayo(dto) {
        return this.mapToDtoStateSalaEnsayo(await this.dao.storeStateSalaEnsayo({
            name: dto.name,
            createdAt: new Date()
        }));
    }
    async findStateSalaEnsayoById(id) {
        const stateSalaEnsayo = await this.dao.findStateSalaEnsayoById(id);
        return this.mapToDtoStateSalaEnsayo(stateSalaEnsayo);
    }
    async getAllStateSalaEnsayos() {
        const stateSalaEnsayos = await this.dao.getAllStateSalaEnsayos();
        return stateSalaEnsayos.map((stateSalaEnsayos) => {
            return this.mapToDtoStateSalaEnsayo(stateSalaEnsayos);
        });
    }
    mapToDtoType(type) {
        return {
            id: type.id,
            name: type.name
        };
    }
    mapToDtoStateSalaEnsayo(stateSalaEnsayo) {
        return {
            name: stateSalaEnsayo.name
        };
    }
}
exports.ManagementService = ManagementService;
exports.instance = new ManagementService(dao.instance);
