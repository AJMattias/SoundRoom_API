"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.instance = exports.ImagenDao = void 0;
const exception_1 = require("../common/exception/exception");
const model_1 = require("./model");
const mongoose_1 = __importDefault(require("mongoose"));
class ImagenDao {
    //mapeo de imagenDoc a Imagen
    mapToImagen(document) {
        return {
            id: document._id,
            url: document.url,
            titulo: document.titulo,
            descripcion: document.descripcion,
            visible: document.visible,
            createdAt: document.createdAt,
            deletedAt: document.deletedAt,
            public_id: document.public_id
        };
    }
    //store a new imagen
    async createImagen(imagen) {
        const imagenDoc = await model_1.ImagenModel.create({
            titulo: imagen.titulo,
            descripcion: imagen.descripcion,
            url: imagen.url,
            createdAt: new Date(),
            visible: true,
            public_id: imagen.public_id
        });
        return this.mapToImagen(imagenDoc);
    }
    //get all images visible
    async getAll() {
        return (await model_1.ImagenModel.find({ visible: true }).exec())
            .map((doc) => {
            return this.mapToImagen(doc);
        });
    }
    async getAllRemoved() {
        // const query = ImagenModel.find({ visible: true });
        // query.where('deletedAt').equals(null);
        // const resultados = await query.exec();
        // return(await ImagenModel.find({ visible: true }).exec())
        // .map((doc: ImagenDoc)=>{
        //     return this.mapToImagen(doc)
        // })
        return (await model_1.ImagenModel.find({ visible: false }).exec())
            .map((doc) => {
            return this.mapToImagen(doc);
        });
    }
    async recover(id) {
        const query = { _id: id };
        const updated = await model_1.ImagenModel.findOneAndUpdate(query, {
            visible: true
        }, { new: true }).exec();
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToImagen(updated);
    }
    async findById(id) {
        const _id = mongoose_1.default.Types.ObjectId(id);
        const model = await model_1.ImagenModel.findById({ _id }).exec();
        if (!model)
            throw new exception_1.ModelNotFoundException();
        return this.mapToImagen(model);
    }
    async updateImagen(idImage, data) {
        const query = { _id: idImage };
        const updated = await model_1.ImagenModel.findOneAndUpdate(query, {
            titulo: data.titulo,
            descripcion: data.descripcion,
            createdAt: data.createdAt,
            visible: data.visible
        }, { new: true }).exec();
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToImagen(updated);
    }
    async deleteImagen(id, data) {
        const deleted = await model_1.ImagenModel.findByIdAndUpdate(id, {
            titulo: data.titulo,
            descripcion: data.descripcion,
            url: data.url,
            createdAt: data.createdAt,
            deletedAt: data.deletedAt,
            visible: false
        }).exec();
        if (!deleted) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToImagen(deleted);
    }
    async removeImage(id) {
        const imagen = await model_1.ImagenModel.findByIdAndRemove(id);
        if (imagen) {
            return true;
        }
        else {
            return false;
        }
    }
}
exports.ImagenDao = ImagenDao;
exports.instance = new ImagenDao();
