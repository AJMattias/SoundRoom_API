"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instance = exports.ConfiguracionDao = void 0;
const models_1 = require("./models");
const exception_1 = require("../common/exception/exception");
class ConfiguracionDao {
    async getAll() {
        return (await models_1.ConfiguracionModel.find({}).exec())
            .map((doc) => {
            return this.mapToConfiguracion(doc);
        });
    }
    async findById(configuracionId) {
        const model = await models_1.ConfiguracionModel.findById(configuracionId).exec();
        if (!model)
            throw new exception_1.ModelNotFoundException();
        return this.mapToConfiguracion(model);
    }
    async deleteById(configuracionId) {
        const updated = await models_1.ConfiguracionModel.findByIdAndUpdate(configuracionId, {
            deletedAt: new Date()
        }).exec();
        if (!updated)
            throw new exception_1.ModelNotFoundException();
        return this.mapToConfiguracion(updated);
    }
    async updateConfiguracion(configuracionId, configuracion) {
        //Setea el deleteAt de la configuracion anterior
        const updated = await models_1.ConfiguracionModel.findByIdAndUpdate(configuracionId, {
            deletedAt: configuracion.deletedAt
        }).exec();
        //setea un nuevo configuracion, para que no se pierdan configuraciones pasadas
        const configuracionDoc = await models_1.ConfiguracionModel.create({
            tiempoBloqueo: configuracion.tiempoBloqueo,
            maximoIntentos: configuracion.maximoIntentos,
            porcentajeComision: configuracion.porcentajeComision,
            createdAt: configuracion.createdAt
        });
        if (!configuracionDoc) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToConfiguracion(configuracionDoc);
    }
    async store(configuracion) {
        //eliminar configuraciones previas
        await models_1.ConfiguracionModel.findOneAndUpdate({
            deletedAt: undefined
        }, {
            deletedAt: configuracion.deletedAt
        });
        //crear nueva configuracion
        const configuracionDoc = await models_1.ConfiguracionModel.create({
            tiempoBloqueo: configuracion.tiempoBloqueo,
            maximoIntentos: configuracion.maximoIntentos,
            porcentajeComision: configuracion.porcentajeComision,
            createdAt: configuracion.createdAt
        });
        return this.mapToConfiguracion(configuracionDoc);
    }
    mapToConfiguracion(configuracion) {
        return {
            tiempoBloqueo: configuracion.tiempoBloqueo,
            maximoIntentos: configuracion.maximoIntentos,
            porcentajeComision: configuracion.porcentajeComision,
            createdAt: configuracion.createdAt,
            deletedAt: configuracion.deletedAt
        };
    }
}
exports.ConfiguracionDao = ConfiguracionDao;
exports.instance = new ConfiguracionDao();
