import { StringUtils } from "src/common/utils/string_utils";
import { ObjectId } from "mongoose";
import { Comodidad, ComodidadDoc, ComodidadModel } from "./models";
import { UserModel } from "../users/models";
import { ModelNotFoundException } from "../common/exception/exception";

export class ComodidadDao{

    async getAll(): Promise<Array<Comodidad>> {
        return (await ComodidadModel.find({}).exec())
        .map((doc: ComodidadDoc) =>{
            return this.mapToComodidad(doc)
        })
    }

    async findById(comodidadId: String): Promise<Comodidad>{
        const model = await ComodidadModel.findById(comodidadId).exec()
        if(!model) throw new ModelNotFoundException()
            return this.mapToComodidad(model)
    }    

    async updateComodidad(comodidadId: String, comodidad: Comodidad): Promise<Comodidad>{
        const updated = await ComodidadModel.findByIdAndUpdate(comodidadId,{
            name: comodidad.name,
            createdAt: new Date(),
        }).exec()
        if(!updated) {
            throw new ModelNotFoundException()
        }
        return this.mapToComodidad(updated)
    }

    async store(comodidad: Comodidad): Promise<Comodidad>{
        const comodidadDoc = await ComodidadModel.create(
            {
                name: comodidad.name,
                createdAt: comodidad.createdAt,
                deletedAt: comodidad.deletedAt
            }
        )
        return this.mapToComodidad(comodidadDoc)
    }

    mapToComodidad(document: ComodidadDoc): Comodidad {
        return {
            name: document.name,
            createdAt: document.createdAt,
            deletedAt: document.deletedAt
        }
    }

}

export const instance = new ComodidadDao()

