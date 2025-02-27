import { StringUtils } from "src/common/utils/string_utils";
import { ObjectId } from "mongoose";
import { Type, StateSalaEnsayo, TypeModel, StateSalaEnsayoModel, TypeDoc, StateSalaEnsayoDoc, StateSalaEnsayoSchema, TypeSchema } from "./models";
import { ModelNotFoundException } from "../common/exception/exception";
import { CreateType } from "./dto";

export class ManagementDao{
//para los tipos
    async getAllTypes(): Promise<Array<Type>> {
        return (await TypeModel.find({}).exec())
        .map((doc: TypeDoc) =>{
            return this.mapToType(doc)
        })
    }

    async findTypeById(typeId: String): Promise<Type>{
        const model = await TypeModel.findById(typeId).exec()
        if(!model) throw new ModelNotFoundException()
            return this.mapToType(model)
    }    

    async updateType(typeId: String, type: Type): Promise<Type>{
        const updated = await TypeModel.findByIdAndUpdate(typeId,{
            name: type.name,
            createdAt: new Date(),
        }).exec()
        if(!updated) {
            throw new ModelNotFoundException()
        }
        return this.mapToType(updated)
    }

    async storeType(type: CreateType): Promise<Type>{
        const typeDoc = await TypeModel.create(
            {
                name: type.name,
                createdAt: type.createdAt
            }
        )
        return this.mapToType(typeDoc)
    }

//para los estados
    async getAllStateSalaEnsayos(): Promise<Array<StateSalaEnsayo>> {
        return (await StateSalaEnsayoModel.find({}).exec())
        .map((doc: StateSalaEnsayoDoc) =>{
            return this.mapToStateSalaEnsayo(doc)
        })
    }

    async findStateSalaEnsayoById(stateSalaEnsayoId: String): Promise<StateSalaEnsayo>{
        const model = await StateSalaEnsayoModel.findById(stateSalaEnsayoId).exec()
        if(!model) throw new ModelNotFoundException()
            return this.mapToStateSalaEnsayo(model)
    }    

    async updateStateSalaEnsayo(stateSalaEnsayoId: String, stateSalaEnsayo : StateSalaEnsayo): Promise<StateSalaEnsayo>{
        const updated = await StateSalaEnsayoModel.findByIdAndUpdate(stateSalaEnsayoId,{
            name: stateSalaEnsayo.name,
            createdAt: new Date(),
        }).exec()
        if(!updated) {
            throw new ModelNotFoundException()
        }
        return this.mapToStateSalaEnsayo(updated)
    }

    async storeStateSalaEnsayo(stateSalaEnsayo: StateSalaEnsayo): Promise<StateSalaEnsayo>{
        const stateSalaEnsayoDoc = await StateSalaEnsayoModel.create(
            {
                name: stateSalaEnsayo.name,
                createdAt: stateSalaEnsayo.createdAt,
                deletedAt: stateSalaEnsayo.deletedAt
            }
        )
        return this.mapToStateSalaEnsayo(stateSalaEnsayoDoc)
    }
//mapeos
    mapToStateSalaEnsayo(document: StateSalaEnsayoDoc): StateSalaEnsayo {
        return {
            name: document.name,
            createdAt: document.createdAt,
            deletedAt: document.deletedAt
        }
    }

    mapToType(document: TypeDoc): Type {
        return {
            id: document._id,
            name: document.name,
            createdAt: document.createdAt,
            deletedAt: document.deletedAt
        }
    }

}

export const instance = new ManagementDao()