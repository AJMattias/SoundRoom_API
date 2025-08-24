import * as dao from "./dao"
import { ConfiguracionDto } from "./dto"
import { Configuracion } from "./models"

export interface createConfiguracionDto{
    tiempoBloqueo: Number;
    maximoIntentos: Number;
    porcentajeComision: Number;
}

export class ConfiguracionService{
    /*@param {dao.ConfiguracionDao} dao.ConfiguracionDao*/
    dao: dao.ConfiguracionDao;
    constructor(configuracionDao: dao.ConfiguracionDao){
        this.dao = configuracionDao;
    }


    async createConfiguracion(dto: createConfiguracionDto): Promise<ConfiguracionDto>{
        return this.mapToDto(
            await this.dao.store({
                tiempoBloqueo: dto.tiempoBloqueo,
                maximoIntentos: dto.maximoIntentos,
                porcentajeComision: dto.porcentajeComision,
                createdAt: new Date(),
                deletedAt: new Date()
            })
        )
    }

    async findConfiguracionById(id: string) : Promise<ConfiguracionDto>{
        const configuracion = await this.dao.findById(id)
        return this.mapToDto(configuracion)
    }
    async deleteConfiguracionById(id: string) : Promise<ConfiguracionDto>{
        const configuracion = await this.dao.deleteById(id)
        return this.mapToDto(configuracion)
    }
    async getAllConfiguraciones(): Promise<Array<ConfiguracionDto>>{
        const configuraciones = await this.dao.getAll()
        return configuraciones.map((configuraciones: Configuracion) => {
            return this.mapToDto(configuraciones)
        })
    }


    async updateConfiguracion(userId: string, dto : createConfiguracionDto) : Promise<ConfiguracionDto>{
        return  this.mapToDto( 
            await this.dao.updateConfiguracion(userId, {
                tiempoBloqueo: dto.tiempoBloqueo,
                maximoIntentos: dto.maximoIntentos,
                porcentajeComision: dto.porcentajeComision,
                createdAt: new Date(),
                deletedAt: new Date()
            })
        )
    }


    mapToDto(configuracion: Configuracion) : ConfiguracionDto{
        return{
            tiempoBloqueo: Number(configuracion.tiempoBloqueo),
            maximoIntentos: configuracion.maximoIntentos,
            porcentajeComision: configuracion.porcentajeComision,
            createdAt: configuracion.createdAt,
            deletedAt: configuracion.deletedAt
        }
    }

}
export const instance = new ConfiguracionService(dao.instance)