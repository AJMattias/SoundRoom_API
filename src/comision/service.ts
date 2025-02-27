import  * as dao from "./dao"
import { ComisionDto, CreateComisionDto } from "./dto"
import { Comision, ComisionModel } from "./model"
import {AuthenticationException, ServerException} from "../common/exception/exception"
import * as jwt from "jsonwebtoken"
import * as dotenv from "dotenv"
import { Types } from "mongoose"
dotenv.config()

export class ComisionService{

    dao : dao.ComisionDao;
    constructor(comisionDao : dao.ComisionDao){
        this.dao = comisionDao
    }

    mapToComision(comision: Comision): ComisionDto{
        return{
            id: comision.id,
            porcentaje: comision.porcentaje,
            createdAt: comision.createdAt,
            deletedAt: comision.deletedAt,
            enabled: comision.enabled
        }
    }

    async createComision(dto: CreateComisionDto): Promise<ComisionDto>{
        try{
        const comisionEnabled = this.findEnabled()
        const comisionNotEnabled = this.dao.updateComision((await comisionEnabled).id,{
            porcentaje: (await comisionEnabled).porcentaje,
            createdAt: (await comisionEnabled).createdAt,
            deletedAt: new Date(),
            enabled: 'false',
        })
        }catch(error){
            console.log("no comision enabled")
        }
        return this.mapToComision(
            await this.dao.store({
                porcentaje: dto.porcentaje,
                enabled: 'true',
                createdAt: new Date()
            })
        )
    }

    async getAllComisiones() : Promise<Array<ComisionDto>>{
        const comisiones = await this.dao.getAll()
        return comisiones.map((comision: Comision) => {
            return this.mapToComision(comision)
        })
    }

    async findComisionById(id : string) : Promise<ComisionDto>{
        const comision = await this.dao.findById(id)
        return this.mapToComision(comision)
    }

    async findEnabled() : Promise<ComisionDto>{
        const comision = await this.dao.findEnabled()
        return this.mapToComision(comision)
    }

    async updateComision(comisionId: string, dto: CreateComisionDto) : Promise<ComisionDto>{
        return this.mapToComision(
            await this.dao.updateComision(comisionId, {
                porcentaje: dto.porcentaje,
                enabled: dto.enabled,
                createdAt: new Date,
            })
        )
    }

    async deleteComision(comisionId: string) : Promise<ComisionDto>{
        return this.mapToComision(
            await this.dao.deleteComision(comisionId)
        )
    }

     async actualizarComision(comisionId: string
        //, dto: CreateComisionDto
    ) : Promise<ComisionDto>{
     
        if (!Types.ObjectId.isValid(comisionId)) {
            throw new Error('ID inválido');
        }

        const exists = await ComisionModel.exists({ _id: comisionId });
        const comisionToEnable = await this.dao.findById(comisionId)
        if (exists) {
            //busco comision habilitada
            //const comisionEnabled = await this.findEnabled()
            const comisionEnabled =await this.dao.findEnabled()
            
            console.log('comision service, comisionenabled:' , comisionEnabled)
            //deshabilito comision
            const comisionNotEnabled = this.dao.updateComision(( comisionEnabled).id,{
                porcentaje: (comisionEnabled).porcentaje,
                createdAt: (comisionEnabled).createdAt,
                deletedAt: new Date(),
                enabled: 'false',
            })
            //habilito comision nueva
            //const comisionToEnable = await this.dao.findById(comisionId)
            const updated = await this.dao.updateComision(comisionId, {
                porcentaje: comisionToEnable.porcentaje,
                enabled: 'true',
                createdAt: new Date()
            })
            return this.mapToComision({
                id: ( updated).id,
                porcentaje: ( updated).porcentaje,
                enabled: ( updated).enabled,
                createdAt: ( updated).createdAt,
            })
        }
        else{
            //si no existe comision 
            
            const updated = await this.dao.updateComision(comisionId, {
                porcentaje: comisionToEnable.porcentaje,
                enabled: 'true',
                createdAt: new Date()
            })
            return this.mapToComision({
                id: (updated).id,
                porcentaje: (updated).porcentaje,
                enabled: (updated).enabled,
                createdAt: (updated).createdAt,
            })
        }
     }

     async updateComisionEnabled(comisionId: string): Promise<ComisionDto>{
        console.log('service update comision')
        
        const exists = await ComisionModel.exists({ enabled: 'true' });
        console.log('servicio comisionEnabled: ', exists)
        if(exists){
            const comisionEnabled = await this.dao.findEnabled()
            try{
                //deshabiltar comision habilitada
                const comisionNotEnabled = this.dao.updateComision(comisionEnabled.id,{
                    porcentaje: ( comisionEnabled).porcentaje,
                    createdAt: ( comisionEnabled).createdAt,
                    deletedAt: new Date(),
                    enabled: 'false',
                })
                console.log('comision dehsbilitada: ', comisionNotEnabled)
            }catch(error){
                console.log("no comision enabled")
            }
            const comisionToUpdate = await this.dao.findById(comisionId)
            return this.mapToComision(
                await this.dao.updateComision(comisionId,{
                    porcentaje: comisionToUpdate.porcentaje,
                    enabled: 'true',
                    createdAt: new Date()
                })
            )
        }
        // sino hay comision habilitada
        else{
            const comisionToUpdate = await this.dao.findById(comisionId)
            console.log('comision ha habilitar: ', comisionToUpdate)
            try {
                const comisionUpdated = await this.dao.updateComision(comisionId,{
                    porcentaje: comisionToUpdate.porcentaje,
                    createdAt: new Date(),
                    enabled: 'true',
                })
                console.log('comision habilitada: ', comisionUpdated)
                return this.mapToComision(comisionUpdated)
            } catch (error) {
                console.log("comision no actualizada")
            }   
        }
        throw new Error('No se pudo actualizar o crear una nueva comisión');
        }



}
export const instance = new ComisionService(dao.instance)
