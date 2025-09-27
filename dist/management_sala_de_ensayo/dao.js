"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instance = exports.ManagementDao = void 0;
const models_1 = require("./models");
const exception_1 = require("../common/exception/exception");
class ManagementDao {
    //para los tipos
    async getAllTypes() {
        return (await models_1.TypeModel.find({}).exec())
            .map((doc) => {
            return this.mapToType(doc);
        });
    }
    async findTypeById(typeId) {
        const model = await models_1.TypeModel.findById(typeId).exec();
        if (!model)
            throw new exception_1.ModelNotFoundException();
        return this.mapToType(model);
    }
    async updateType(typeId, type) {
        const updated = await models_1.TypeModel.findByIdAndUpdate(typeId, {
            name: type.name,
            createdAt: new Date(),
        }).exec();
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToType(updated);
    }
    async storeType(type) {
        const typeDoc = await models_1.TypeModel.create({
            name: type.name,
            createdAt: type.createdAt
        });
        return this.mapToType(typeDoc);
    }
    //para los estados
    async getAllStateSalaEnsayos() {
        return (await models_1.StateSalaEnsayoModel.find({}).exec())
            .map((doc) => {
            return this.mapToStateSalaEnsayo(doc);
        });
    }
    async findStateSalaEnsayoById(stateSalaEnsayoId) {
        const model = await models_1.StateSalaEnsayoModel.findById(stateSalaEnsayoId).exec();
        if (!model)
            throw new exception_1.ModelNotFoundException();
        return this.mapToStateSalaEnsayo(model);
    }
    async updateStateSalaEnsayo(stateSalaEnsayoId, stateSalaEnsayo) {
        const updated = await models_1.StateSalaEnsayoModel.findByIdAndUpdate(stateSalaEnsayoId, {
            name: stateSalaEnsayo.name,
            createdAt: new Date(),
        }).exec();
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToStateSalaEnsayo(updated);
    }
    async storeStateSalaEnsayo(stateSalaEnsayo) {
        const stateSalaEnsayoDoc = await models_1.StateSalaEnsayoModel.create({
            name: stateSalaEnsayo.name,
            createdAt: stateSalaEnsayo.createdAt,
            deletedAt: stateSalaEnsayo.deletedAt
        });
        return this.mapToStateSalaEnsayo(stateSalaEnsayoDoc);
    }
    //mapeos
    mapToStateSalaEnsayo(document) {
        return {
            name: document.name,
            createdAt: document.createdAt,
            deletedAt: document.deletedAt
        };
    }
    mapToType(document) {
        return {
            id: document._id,
            name: document.name,
            createdAt: document.createdAt,
            deletedAt: document.deletedAt
        };
    }
}
exports.ManagementDao = ManagementDao;
exports.instance = new ManagementDao();
