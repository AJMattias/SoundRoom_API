import { StringUtils } from "src/common/utils/string_utils";
import { ObjectId } from "mongoose";
import { Configuracion, ConfiguracionDoc, ConfiguracionModel } from "./models";
import { UserModel } from "../users/models";
import { ModelNotFoundException } from "../common/exception/exception";

export class ConfiguracionDao{

    async getAll(): Promise<Array<Configuracion>> {
        return (await ConfiguracionModel.find({}).exec())
        .map((doc: ConfiguracionDoc) =>{
            return this.mapToConfiguracion(doc)
        })
    }

    async findById(configuracionId: String): Promise<Configuracion>{
        const model = await ConfiguracionModel.findById(configuracionId).exec()
        if(!model) throw new ModelNotFoundException()
            return this.mapToConfiguracion(model)
    }    

    async deleteById(configuracionId: String): Promise<Configuracion>{
        const updated = await ConfiguracionModel.findByIdAndUpdate(configuracionId,{
            deletedAt: new Date()
        }).exec()
        if(!updated) throw new ModelNotFoundException()
            return this.mapToConfiguracion(updated)
    }  

    async updateConfiguracion(configuracionId: String, configuracion: Configuracion): Promise<Configuracion>{
        //Setea el deleteAt de la configuracion anterior
         const updated = await ConfiguracionModel.findByIdAndUpdate(configuracionId,{
            deletedAt: configuracion.deletedAt
        }).exec()
        //setea un nuevo configuracion, para que no se pierdan configuraciones pasadas
        const configuracionDoc = await ConfiguracionModel.create(
            {
            tiempoBloqueo: configuracion.tiempoBloqueo,
            maximoIntentos: configuracion.maximoIntentos,
            porcentajeComision: configuracion.porcentajeComision,
                createdAt: configuracion.createdAt
            }
        )
        if(!configuracionDoc) {
            throw new ModelNotFoundException()
        }
        return this.mapToConfiguracion(configuracionDoc)
    }

    async store(configuracion: Configuracion): Promise<Configuracion>{
        //eliminar configuraciones previas
        await ConfiguracionModel.findOneAndUpdate(
            {
                deletedAt: undefined
            },
            {            
                deletedAt: configuracion.deletedAt
            }
        )
        //crear nueva configuracion
        const configuracionDoc = await ConfiguracionModel.create(
            {
                tiempoBloqueo: configuracion.tiempoBloqueo,
                maximoIntentos: configuracion.maximoIntentos,
                porcentajeComision: configuracion.porcentajeComision,
                createdAt: configuracion.createdAt
            }
        )
        return this.mapToConfiguracion(configuracionDoc)
    }

    mapToConfiguracion(configuracion: ConfiguracionDoc): Configuracion {
        return {
            tiempoBloqueo: configuracion.tiempoBloqueo,
            maximoIntentos: configuracion.maximoIntentos,
            porcentajeComision: configuracion.porcentajeComision,
            createdAt: configuracion.createdAt,
            deletedAt: configuracion.deletedAt
        }
    }

}

export const instance = new ConfiguracionDao()

