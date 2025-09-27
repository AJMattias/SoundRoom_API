"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instance = exports.ComisionDao = void 0;
const model_1 = require("./model");
const exception_1 = require("../common/exception/exception");
class ComisionDao {
    mapToComision(document) {
        return {
            id: document.id,
            porcentaje: document.porcentaje,
            createdAt: document.createdAt,
            deletedAt: document.deletedAt,
            enabled: document.enabled,
            enabledHistory: document.enabledHistory
        };
    }
    mapToEnabledHistory(document) {
        return {
            id: document.id,
            status: document.status,
            dateFrom: document.dateFrom,
            dateTo: document.dateTo
        };
    }
    async getAll() {
        return (await model_1.ComisionModel.find({}).exec())
            .map((doc) => {
            return this.mapToComision(doc);
        });
    }
    async findById(comisionId) {
        const model = await model_1.ComisionModel.findById(comisionId).exec();
        if (!model)
            throw new exception_1.ModelNotFoundException();
        return this.mapToComision(model);
    }
    // async findEnabled(): Promise<Comision> {
    //     // const model = await ComisionModel.findOne({enabled: 'true'})
    //     const model = await ComisionModel.findOne({
    //         enabled: 'true',
    //         //'enabledHistory.status': 'habilitado',
    //         'enabledHistory': {
    //             $elemMatch: {
    //                 status: 'habilitado',
    //                 dateTo: null,
    //             },
    //         }
    //       }).exec();
    //     console.log('dao find enabled: ', model)
    //     if (!model) throw new ModelNotFoundException()
    //     return this.mapToComision(model)
    // }
    async findEnabled(session) {
        const model = await model_1.ComisionModel.findOne({
            enabled: 'true',
            'enabledHistory': {
                $elemMatch: {
                    status: 'habilitado',
                    dateTo: null,
                },
            },
        }, null, { session }).exec();
        console.log('dao find enabled: ', model);
        if (!model)
            throw new exception_1.ModelNotFoundException();
        return this.mapToComision(model);
    }
    // async store(comision: CreateComisionDto): Promise<Comision> {
    //     const comisionDoc  = await ComisionModel.create(
    //         {
    //             porcentaje: comision.porcentaje,
    //             enabled: comision.enabled,
    //             createdAt: comision.createdAt,
    //             enabledHistory: comision.enabledHistory
    //         }
    //     )
    //     console.log('comision creada: ', comisionDoc)
    //     return this.mapToComision(comisionDoc)
    // }
    async store(comision, session) {
        const comisionDoc = await model_1.ComisionModel.create([
            {
                porcentaje: comision.porcentaje,
                enabled: comision.enabled,
                createdAt: comision.createdAt,
                enabledHistory: comision.enabledHistory,
            },
        ], { session });
        console.log('comision creada: ', comisionDoc[0]);
        return this.mapToComision(comisionDoc[0]);
    }
    async updateComision(comisionId, comision) {
        const updated = await model_1.ComisionModel.findByIdAndUpdate(comisionId, {
            porcentaje: comision.porcentaje,
            enabled: comision.enabled,
            createdAt: comision.createdAt,
            deletedAt: comision.deletedAt,
            $push: { enabledHistory: { status: "habilitado", dateFrom: new Date() } }
        });
        console.log('updated comision: ', updated);
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToComision(updated);
    }
    // async updateComisionToDisabled(comisionId: string): Promise<Comision>{
    //     console.log("comision to disable, enabled: false-id , ", comisionId)
    //     const updated = await ComisionModel.findByIdAndUpdate(comisionId, {
    //         enabled: "false"
    //     })
    //     console.log('updated  to disabled comision: ', updated)
    //     if(!updated){
    //         console.log('dao updateComisionToDisabled - !updated')
    //         throw new ModelNotFoundException()
    //     }
    //     return this.mapToComision(updated)
    // }
    async updateComisionToDisabled(comisionId) {
        console.log('comision to disable, enabled: false-id , ', comisionId);
        const updated = await model_1.ComisionModel.findByIdAndUpdate(comisionId, { enabled: 'false' }, { new: true }).exec();
        console.log('updated  to disabled comision: ', updated);
        if (!updated) {
            console.log('dao updateComisionToDisabled - !updated');
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToComision(updated);
    }
    async disableComision(id) {
        console.log('dao stop enable comision');
        const updated = await model_1.ComisionModel.findOneAndUpdate({ _id: id, "enabledHistory.dateTo": null }, { $set: { status: "deshabilitado", "enabledHistory.$.dateTo": new Date() } });
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        console.log('disabled comision: ', updated);
        return this.mapToComision(updated);
    }
    async deleteComision(comisionId) {
        const updated = await model_1.ComisionModel.findByIdAndDelete(comisionId);
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToComision(updated);
    }
    // async updateEnabledHistory(id: string, enabledHistoryDto: UpdateHistoryDto):Promise<EnabledHistory>{
    //     console.log('dao update enabledhistory: id - enabledHistory: ', id, enabledHistoryDto)
    //     const enabledHistory = await EnabledHistoryModel.findByIdAndUpdate(id,{
    //         status: enabledHistoryDto.status,
    //         dateFrom: enabledHistoryDto.dateFrom,
    //         dateTo: enabledHistoryDto.dateTo,
    //     }, { new: true })
    //     if (!enabledHistory) {
    //         throw new ModelNotFoundException(); // O lanza una excepción, como ModelNotFoundException
    //     }
    //     return enabledHistory
    // }
    async updateEnabledHistoryInComision(comisionId) {
        console.log('dao update enabledhistory in comision: comisionId - ', comisionId);
        try {
            const updatedComision = await model_1.ComisionModel.findOneAndUpdate({ _id: comisionId, 'enabledHistory.dateTo': null }, // Encuentra la comisión y el subdocumento activo
            { $set: { 'enabledHistory.$.dateTo': new Date() } }, // Actualiza dateTo del subdocumento
            { new: true }).exec();
            if (!updatedComision) {
                console.log(`Comision with id: ${comisionId} or active enabledHistory not found.`);
                throw new exception_1.ModelNotFoundException();
            }
            console.log('updated comision doc: ', updatedComision);
            return {
                id: updatedComision.id,
                porcentaje: updatedComision.porcentaje,
                createdAt: updatedComision.createdAt,
                deletedAt: updatedComision.deletedAt,
                enabled: updatedComision.enabled,
                enabledHistory: updatedComision.enabledHistory,
            };
        }
        catch (error) {
            console.error('Error updating enabled history in comision:', error);
            throw error;
        }
    }
    //enabledHistory
    async getHistoryById(id) {
        const historyEnabled = await model_1.EnabledHistoryModel.findById(id);
        if (!historyEnabled) {
            throw new exception_1.ModelNotFoundException(); // O lanza una excepción, como ModelNotFoundException
        }
        return this.mapToEnabledHistory(historyEnabled);
    }
}
exports.ComisionDao = ComisionDao;
exports.instance = new ComisionDao();
