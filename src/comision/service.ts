import  * as dao from "./dao"
import { ComisionDto, CreateComisionDto } from "./dto"
import { Comision, ComisionModel, EnabledHistory } from "./model"
import {AuthenticationException, BaseException, ModelNotFoundException, ServerException} from "../common/exception/exception"
import * as jwt from "jsonwebtoken"
import * as dotenv from "dotenv"
import { Types } from "mongoose"
dotenv.config()
import mongoose from 'mongoose'; // Asegúrate de importar mongoose

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
            enabled: comision.enabled,
            enabledHistory: comision.enabledHistory
        }
    }

    // async createComision(dto: CreateComisionDto): Promise<ComisionDto>{
    //     try{
    //     const comisionEnabled = await this.findEnabled()
    //     console.log('comision enabled to disabled: ', comisionEnabled)
    //     //nueva enabled history para nueva comision
    //     const enabledHistoryEntry = {
    //         status: "habilitado",
    //         dateFrom: new Date(),
    //         dateTo: null,
    //     };
    //     //desahibilito la comision habilitada
    //     //const disabledComision = await this.dao.disableComision(comisionEnabled.id)
    //     const disabledHistory = await this.dao.updateEnabledHistory(comisionEnabled.enabledHistory.id, {
    //         status:"deshabilitado",
    //         dateTo: new Date()
    //     })
    //     console.log('comision deshabilitada: ', disabledHistory)
    //     }catch(error){
    //         console.log("no comision enabled")
    //     }
    //     return this.mapToComision(
    //         await this.dao.store({
    //             porcentaje: dto.porcentaje,
    //             enabled: 'true',
    //             createdAt: new Date(),
    //             enabledHistory: {
    //                 status: "habilitado",
    //                 dateFrom: new Date(),
    //                 dateTo: null,
    //             }
    //         })
    //     )
    // }

    // async createComision(dto: CreateComisionDto): Promise<ComisionDto> {
    //     try {
    //         // 1. Deshabilitar la comisión habilitada actual (si existe)
    //         try {
    //             const comisionEnabled = await this.dao.findEnabled();
    //             console.log('¿comisionEnabled: ', comisionEnabled)
    //             // const enabledHistoryToUpdate = comisionEnabled.enabledHistory.find(
    //             //     (history) => history.status === "habilitado" && 
    //             //     history.dateTo === null
    //             // );
    //             let enabledHistoryToUpdate: EnabledHistory | null = null; // Inicializar correctamente
    //             for (const history of comisionEnabled.enabledHistory) {
    //                 if (history.status === "habilitado" && (history.dateTo === null || history.dateTo === undefined)) {
    //                     enabledHistoryToUpdate = history;
    //                     break; // Salir del bucle una vez encontrado el elemento
    //                 }
    //             }
    //             console.log('enabledHistoryToUpdate: ', enabledHistoryToUpdate)
    //             if (enabledHistoryToUpdate) {
    //                 //actualizo fecha fin estado habilitado
    //                 await this.dao.updateEnabledHistory(enabledHistoryToUpdate.id, {
    //                     //status: "deshabilitado",
    //                     dateTo: new Date(),
    //                     dateFrom: enabledHistoryToUpdate.dateFrom,
    //                 });
    //                 console.log('Comisión habilitada deshabilitada correctamente.');
    //             }
    //             const disableComision = await this.dao.updateComisionToDisabled(comisionEnabled.id)
    //             console.log('disabled comision: ', disableComision)
    //         } catch (findError) {
    //             if (findError instanceof ModelNotFoundException) {
    //                 console.log("No se encontró una comisión habilitada para deshabilitar.");
    //             } else {
    //                 throw findError; // Re-lanzar otros errores
    //             }
    //         }
    
    //        // 2. Crear la nueva comisión
    //         const nuevaComision = await this.dao.store({
    //             porcentaje: dto.porcentaje,
    //             enabled: 'true',
    //             createdAt: new Date(),
    //             enabledHistory: {
    //                 status: "habilitado",
    //                 dateFrom: new Date(),
    //                 dateTo: null
    //         }});
    //         console.log('Nueva comisión creada:', nuevaComision);
    
    //         // 3. Mapear y retornar la nueva comisión
    //         return this.mapToComision(nuevaComision);
    //     } catch (error) {
    //         console.error("Error al crear la comisión:", error);
    //         throw error; // Re-lanzar el error para manejarlo en la capa superior
    //     }
    // }

    // async createComision(dto: CreateComisionDto): Promise<ComisionDto> {
    //     try {
    //         // 1. Deshabilitar la comisión habilitada actual (si existe)
    //         try {
    //             const comisionEnabled = await this.dao.findEnabled();
    //             console.log('¿comisionEnabled: ', comisionEnabled);
    
    //             let enabledHistoryToUpdate: EnabledHistory | null = null;
    //             for (const history of comisionEnabled.enabledHistory) {
    //                 if (history.status === "habilitado" && (history.dateTo === null || history.dateTo === undefined)) {
    //                     enabledHistoryToUpdate = history;
    //                     break;
    //                 }
    //             }
    //             console.log('enabledHistoryToUpdate: ', enabledHistoryToUpdate);
    
    //             if (enabledHistoryToUpdate) {
    //                 //actualizo fecha fin estado habilitado
    //                 await this.dao.updateEnabledHistory(enabledHistoryToUpdate.id, {
    //                     dateTo: new Date(),
    //                     dateFrom: enabledHistoryToUpdate.dateFrom,
    //                 });
    //                 console.log('Comisión habilitada deshabilitada correctamente.');
    //                 // Actualizar el estado 'enabled' de la comisión principal
    //                 await this.dao.updateComisionToDisabled(comisionEnabled.id);
    //             }
    //         } catch (findError) {
    //             if (findError instanceof ModelNotFoundException) {
    //                 console.log("No se encontró una comisión habilitada para deshabilitar.");
    //             } else {
    //                 throw findError;
    //             }
    //         }
    
    //         // 2. Crear la nueva comisión
    //         const nuevaComision = await this.dao.store({
    //             porcentaje: dto.porcentaje,
    //             enabled: 'true',
    //             createdAt: new Date(),
    //             enabledHistory: {
    //                 status: "habilitado",
    //                 dateFrom: new Date(),
    //                 dateTo: undefined,
    //             }
    //         });
    //         console.log('Nueva comisión creada:', nuevaComision);
    
    //         // 3. Mapear y retornar la nueva comisión
    //         return this.mapToComision(nuevaComision);
    //     } catch (error) {
    //         console.error("Error al crear la comisión:", error);
    //         throw error;
    //     }
    // }

    
    async createComision(dto: CreateComisionDto): Promise<ComisionDto> {
        try {
            // 1. Buscar la comisión habilitada actual (si existe)
            // const comisionEnabled = await this.dao.findEnabled();
            // console.log('¿comisionEnabled: ', comisionEnabled);
            const exists = await ComisionModel.exists({ enabled: 'true' });
            console.log('servicio comisionEnabled: ', exists); 

            if (exists) {
                const comisionEnabled = await this.dao.findEnabled();
                console.log('¿comisionEnabled: ', comisionEnabled)
               
            
                // 2. Deshabilitar la comisión y su enabledHistory
                await this.dao.updateEnabledHistoryInComision(comisionEnabled.id);
                await this.dao.updateComisionToDisabled(comisionEnabled.id);
                console.log('Comisión habilitada deshabilitada correctamente.');
            }else {
                console.log("No existe comision habilitada.")
            }

            // 3. Crear la nueva comisión
            const nuevaComision = await this.dao.store({
                porcentaje: dto.porcentaje,
                enabled: 'true',
                createdAt: new Date(),
                enabledHistory: {
                    status: 'habilitado',
                    dateFrom: new Date()
                },
            });
            console.log('Nueva comisión creada:', nuevaComision);

            // 4. Mapear y retornar la nueva comisión
            return this.mapToComision(nuevaComision);
        } catch (error) {
            console.error('Error al crear la comisión:', error);
            throw error;
        }
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
            const comisionNotEnabled = await this.dao.updateComision(( comisionEnabled).id,{
                porcentaje: (comisionEnabled).porcentaje,
                createdAt: (comisionEnabled).createdAt,
                deletedAt: new Date(),
                enabled: 'false',
            })
            //deshabilitar estado comision
            await this.dao.disableComision(comisionEnabled.id)
            //habilito comision nueva
            //const comisionToEnable = await this.dao.findById(comisionId)
            const updated = await this.dao.updateComision(comisionId, {
                porcentaje: comisionToEnable.porcentaje,
                enabled: "true",
                //createdAt: new Date(),
                enabledHistory: {
                    status: "habilitado",
                    dateFrom: new Date(),
                    dateTo: undefined,
                }
            })
            return this.mapToComision({
                id: ( updated).id,
                porcentaje: ( updated).porcentaje,
                enabled: ( updated).enabled,
                createdAt: ( updated).createdAt,
                enabledHistory: (updated).enabledHistory
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
                enabledHistory: (updated).enabledHistory
            })
        }
     }

    // async updateComisionEnabled(comisionId: string): Promise<ComisionDto>{
    // console.log('service update comision')

    // const exists = await ComisionModel.exists({ enabled: 'true' });
    // console.log('servicio comisionEnabled: ', exists)
    // if(exists){
    //     const comisionEnabled = await this.dao.findEnabled()
    //     try{
    //         //deshabiltar comision habilitada
    //         const comisionNotEnabled = this.dao.updateComision(comisionEnabled.id,{
    //             porcentaje: ( comisionEnabled).porcentaje,
    //             createdAt: ( comisionEnabled).createdAt,
    //             deletedAt: new Date(),
    //             enabled: 'false',
    //         })
    //         console.log('comision dehsbilitada: ', comisionNotEnabled)
    //     }catch(error){
    //         console.log("no comision enabled")
    //     }
    //     const comisionToUpdate = await this.dao.findById(comisionId)
    //     return this.mapToComision(
    //         await this.dao.updateComision(comisionId,{
    //             porcentaje: comisionToUpdate.porcentaje,
    //             enabled: 'true',
    //             createdAt: new Date()
    //         })
    //     )
    // }
    // // sino hay comision habilitada
    // else{
    //     const comisionToUpdate = await this.dao.findById(comisionId)
    //     console.log('comision ha habilitar: ', comisionToUpdate)
    //     try {
    //         const comisionUpdated = await this.dao.updateComision(comisionId,{
    //             porcentaje: comisionToUpdate.porcentaje,
    //             createdAt: new Date(),
    //             enabled: 'true',
    //         })
    //         console.log('comision habilitada: ', comisionUpdated)
    //         return this.mapToComision(comisionUpdated)
    //     } catch (error) {
    //         console.log("comision no actualizada")
    //     }   
    // }
    // throw new Error('No se pudo actualizar o crear una nueva comisión');
    // }

    async updateComisionEnabled(comisionId: string): Promise<ComisionDto> {
        console.log('service update comision');

        try {
            // 1. Buscar la comisión habilitada actual (si existe)
            const exists = await ComisionModel.exists({ enabled: 'true' });
            console.log('servicio comisionEnabled: ', exists);

            if (exists) {
                // 2. Deshabilitar la comisión habilitada actual
                const comisionEnabled = await this.dao.findEnabled();
                await this.dao.updateEnabledHistoryInComision(comisionEnabled.id);
                await this.dao.updateComisionToDisabled(comisionEnabled.id);
                console.log('Comisión habilitada deshabilitada correctamente.');
            }

            // 3. Habilitar la comisión especificada
            const comisionToUpdate = await this.dao.findById(comisionId);
            const comisionUpdated = await this.dao.updateComision(comisionId, {
                porcentaje: comisionToUpdate.porcentaje,
                enabled: 'true',
                createdAt: new Date(),
                enabledHistory: {
                    status: 'habilitado',
                    dateFrom: new Date()
                },
            });
            console.log('Comisión habilitada:', comisionUpdated);

            // 4. Mapear y retornar la comisión habilitada
            return this.mapToComision(comisionUpdated);
        } catch (error) {
            console.error('Error al actualizar la comisión:', error);
            throw error;
        }
    }

    async softDeleteComision(comisionId: string, dto: CreateComisionDto) : Promise<ComisionDto>{
        return this.mapToComision(
            await this.dao.updateComision(comisionId, {
                porcentaje: dto.porcentaje,
                enabled: dto.enabled,
                deletedAt: new Date,
            })
        )
    }



}
export const instance = new ComisionService(dao.instance)
