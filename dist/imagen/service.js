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
exports.instance = exports.ImagenService = void 0;
const dao = __importStar(require("./dao"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const cloudinary_1 = require("cloudinary");
class ImagenService {
    constructor(imagenDao) {
        this.dao = imagenDao;
    }
    mapToDto(imagen) {
        return {
            id: imagen.id,
            url: imagen.url,
            titulo: imagen.titulo,
            descripcion: imagen.descripcion,
            visible: imagen.visible,
            createdAt: imagen.createdAt,
            public_id: imagen.public_id
        };
    }
    //serviceio de store imagen
    async createImagen(dto) {
        return this.mapToDto(await this.dao.createImagen({
            titulo: dto.titulo,
            descripcion: dto.descripcion,
            url: dto.url,
            createdAt: new Date(),
            visible: true,
            public_id: dto.public_id
        }));
    }
    async getAllImagens() {
        const imagens = await this.dao.getAll();
        return imagens.map((imagen) => {
            return this.mapToDto(imagen);
        });
    }
    async findImagenById(id) {
        const imagen = await this.dao.findById(id);
        return this.mapToDto(imagen);
    }
    async updateImage(id, dto) {
        const image = await this.findImagenById(id);
        console.log(dto);
        if (!dto.titulo) {
            dto.titulo = image.titulo;
        }
        if (!dto.descripcion) {
            dto.descripcion = image.descripcion;
        }
        if (!dto.url) {
            dto.url = image.url;
        }
        if (!dto.createdAt) {
            dto.createdAt = image.createdAt;
        }
        if (!dto.public_id) {
            dto.public_id = image.public_id;
        }
        return this.mapToDto(await this.dao.updateImagen(id, {
            titulo: dto.titulo,
            descripcion: dto.descripcion,
            createdAt: dto.createdAt,
            url: dto.url,
            visible: true,
            public_id: dto.public_id
        }));
    }
    async deleteImage(id, dto) {
        return this.mapToDto(await this.dao.deleteImagen(id, {
            titulo: dto.titulo,
            descripcion: dto.descripcion,
            url: dto.url,
            //createdAt queda en null al borrar, ver esto
            createdAt: dto.createdAt,
            deletedAt: new Date(),
            visible: false,
            public_id: dto.public_id
        }));
    }
    //TODO: hacer el delete de la base de datos no logica, con findByIdAndRemove
    async removeImage(id) {
        const imagenToRemove = await this.dao.findById(id);
        await cloudinary_1.v2.uploader.destroy(imagenToRemove.public_id);
        const imagen = await dao.instance.removeImage(id);
        if (imagen) {
            await fs_extra_1.default.unlink(path_1.default.resolve(imagenToRemove.url));
            return true;
        }
        else {
            return false;
        }
    }
}
exports.ImagenService = ImagenService;
exports.instance = new ImagenService(dao.instance);
