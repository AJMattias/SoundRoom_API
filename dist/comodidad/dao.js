"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instance = exports.ComodidadDao = void 0;
const models_1 = require("./models");
const exception_1 = require("../common/exception/exception");
class ComodidadDao {
    async getAll() {
        return (await models_1.ComodidadModel.find({}).exec())
            .map((doc) => {
            return this.mapToComodidad(doc);
        });
    }
    async findById(comodidadId) {
        const model = await models_1.ComodidadModel.findById(comodidadId).exec();
        if (!model)
            throw new exception_1.ModelNotFoundException();
        return this.mapToComodidad(model);
    }
    async updateComodidad(comodidadId, comodidad) {
        const updated = await models_1.ComodidadModel.findByIdAndUpdate(comodidadId, {
            name: comodidad.name,
            createdAt: new Date(),
        }).exec();
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToComodidad(updated);
    }
    async store(comodidad) {
        const comodidadDoc = await models_1.ComodidadModel.create({
            name: comodidad.name,
            createdAt: comodidad.createdAt,
            deletedAt: comodidad.deletedAt
        });
        return this.mapToComodidad(comodidadDoc);
    }
    mapToComodidad(document) {
        return {
            name: document.name,
            createdAt: document.createdAt,
            deletedAt: document.deletedAt
        };
    }
}
exports.ComodidadDao = ComodidadDao;
exports.instance = new ComodidadDao();
