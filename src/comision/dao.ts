import { Comision, ComisionModel, ComisionDoc } from "./model"
import { ModelNotFoundException } from "../common/exception/exception"
import {StringUtils} from "../common/utils/string_utils"
import { ComisionDto, CreateComisionDto } from "./dto"

export class ComisionDao{

    mapToComision(document: ComisionDoc): Comision{
        return{
            id: document.id,
            porcentaje: document.porcentaje,
            createdAt: document.createdAt,
            deletedAt: document.deletedAt,
            enabled: document.enabled
        }
    }

    async getAll(): Promise<Array<Comision>>{
        return (await ComisionModel.find({}).exec())
         .map((doc: ComisionDoc) => {
            return this.mapToComision(doc)
            }
        )
    }

    async findById(comisionId: String): Promise<Comision> {
        const model = await ComisionModel.findById(comisionId).exec()
        if (!model) throw new ModelNotFoundException()
        return this.mapToComision(model)
    }

    async findEnabled(): Promise<Comision> {
        const model = await ComisionModel.findOne({enabled: 'true'})
        console.log('dao find enabled: ', model)
        if (!model) throw new ModelNotFoundException()
        return this.mapToComision(model)
    }
    async store(comision: CreateComisionDto): Promise<Comision> {
        const comisionDoc  = await ComisionModel.create(
            {
                porcentaje: comision.porcentaje,
                enabled: comision.enabled,
                createdAt: comision.createdAt
            }
        )
        return this.mapToComision(comisionDoc)
    }

    async updateComision(comisionId: string, comision: CreateComisionDto): Promise<Comision>{
        const updated = await ComisionModel.findByIdAndUpdate(comisionId, {
            porcentaje: comision.porcentaje,
            enabled: comision.enabled,
            createdAt: comision.createdAt,
            deletedAt: comision.deletedAt
        })
        if(!updated){
            throw new ModelNotFoundException()
        }
        return this.mapToComision(updated)
    }
/**
 * ComisionModel.findByIdAndUpdate(comisionId, {
            porcentaje: comision.porcentaje,
            enabled: comision.enabled,
            createdAt:comision.createdAt
        }).exec()
 * 
 */
    async deleteComision(comisionId: string): Promise<Comision>{
        const updated = await ComisionModel.findByIdAndDelete(comisionId)
        if(!updated){
            throw new ModelNotFoundException()
        }
        return this.mapToComision(updated)
    }


}
export const instance = new ComisionDao()
