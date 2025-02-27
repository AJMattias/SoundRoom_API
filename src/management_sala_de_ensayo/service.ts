import * as dao from "./dao"
import { TypeDto, StateSalaEnsayoDto, CreateType } from "./dto"
import { StateSalaEnsayo, Type, TypeModel, StateSalaEnsayoModel, TypeDoc, StateSalaEnsayoDoc, StateSalaEnsayoSchema, TypeSchema } from "./models"

export interface createTypeDto{
    name: string;
}

export interface createStateSalaEnsayoDto{
    name: string;
}

export class ManagementService{
    /*@param {dao.ManagementDao} dao.ManagementDao*/
    dao: dao.ManagementDao;
    constructor(managementDao: dao.ManagementDao){
        this.dao = managementDao;
    }

    //Creado de tipo
    async createType(dto: CreateType): Promise<TypeDto>{
        return this.mapToDtoType(
            await this.dao.storeType({
                name: dto.name,
                createdAt: new Date()
            })
        )
    }

    async findTypeById(id: string) : Promise<TypeDto>{
        const type = await this.dao.findTypeById(id)
        return this.mapToDtoType(type)
    }

    async getAllTypes(): Promise<Array<TypeDto>>{
        const types = await this.dao.getAllTypes()
        console.log('service type sala: ', types)
        return types.map((types: Type) => {
            return this.mapToDtoType(types)
        })
    }

    //creadi de estado de salas de ensayo
    async createStateSalaEnsayo(dto: createStateSalaEnsayoDto): Promise<StateSalaEnsayoDto>{
        return this.mapToDtoStateSalaEnsayo(
            await this.dao.storeStateSalaEnsayo({
                name: dto.name,
                createdAt: new Date()
            })
        )
    }

    async findStateSalaEnsayoById(id: string) : Promise<StateSalaEnsayoDto>{
        const stateSalaEnsayo = await this.dao.findStateSalaEnsayoById(id)
        return this.mapToDtoStateSalaEnsayo(stateSalaEnsayo)
    }

    async getAllStateSalaEnsayos(): Promise<Array<StateSalaEnsayoDto>>{
        const stateSalaEnsayos = await this.dao.getAllStateSalaEnsayos()
        return stateSalaEnsayos.map((stateSalaEnsayos: StateSalaEnsayo) => {
            return this.mapToDtoStateSalaEnsayo(stateSalaEnsayos)
        })
    }

    mapToDtoType(type: Type) : TypeDto{
        return{
            id: type.id,
            name: type.name
        }
    }

    mapToDtoStateSalaEnsayo(stateSalaEnsayo: StateSalaEnsayo) : StateSalaEnsayoDto{
        return{
            name: stateSalaEnsayo.name
        }
    }

}
export const instance = new ManagementService(dao.instance)