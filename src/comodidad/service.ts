import * as dao from "./dao"
import { ComodidadDto } from "./dto"
import { Comodidad } from "./models"

export interface createComodidadDto{
    name: string;
}

export class ComodidadService{
    /*@param {dao.ComodidadDao} dao.ComodidadDao*/
    dao: dao.ComodidadDao;
    constructor(comodidadDao: dao.ComodidadDao){
        this.dao = comodidadDao;
    }


    async createComodidad(dto: createComodidadDto): Promise<ComodidadDto>{
        return this.mapToDto(
            await this.dao.store({
                name: dto.name,
                createdAt: new Date()
            })
        )
    }

    async findComodidadById(id: string) : Promise<ComodidadDto>{
        const comodidad = await this.dao.findById(id)
        return this.mapToDto(comodidad)
    }

    async getAllComodidades(): Promise<Array<ComodidadDto>>{
        const comodidades = await this.dao.getAll()
        return comodidades.map((comodidades: Comodidad) => {
            return this.mapToDto(comodidades)
        })
    }



    mapToDto(comodidad: Comodidad) : ComodidadDto{
        return{
            name: comodidad.name
        }
    }

}
export const instance = new ComodidadService(dao.instance)