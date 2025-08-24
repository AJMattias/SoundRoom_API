import  * as dao from "./dao"
import {LocalityDto, ProvinceDto} from "./dto"
import {Province} from "./models"
import {Locality} from "./modelsL"

export interface CreateLocalityDto {
    nameLocality: string;
    idProvince?: string;
}
export interface CreateProvinceDto {
    nameProvince: string;
}

export class LocationService{
    /**
     * El dao que usaremos internamente para acceder a la base de datos.
     * @param {dao.LocationDao} LocationDao 
     */
    dao : dao.LocationDao;
    constructor(LocationDao : dao.LocationDao){
        this.dao = LocationDao
    }
    /***
     * Guarda una localidad en la base de datos y retorna la localidad creada
     * TODO : validar
     */
   async createLocality(dto : CreateLocalityDto) : Promise<LocalityDto>{
        return  this.mapToDtoL( 
            await this.dao.storeL({
                nameLocality:  dto.nameLocality,
                idProvince: dto.idProvince as unknown as string

            })
        )
    }
   async updateLocality(id: string, dto : CreateLocalityDto) : Promise<LocalityDto>{
        return  this.mapToDtoL( 
            await this.dao.updateL(id,{
                nameLocality:  dto.nameLocality,
                idProvince: dto.idProvince as unknown as string

            })
        )
    }
    /**
     * Busca a una localidad a partir de una ID. 
     * Tira un ModelNotFoundException si no encuentra a la Entidad 
     * @param id {string} la id  del usuario a buscar
     * @returns {LocalityDto} el usuario encontrado.
     * @throws {ModelNotFoundException}
     */
    async findLocalityById(id : string) : Promise<LocalityDto>{
        const locality = await this.dao.findByIdL(id)
        return this.mapToDtoL(locality)
    }
    async getAllLocalities() : Promise<Array<LocalityDto>>{
        const locality = await this.dao.getAllLocalities()
        return locality.map((locality: Locality) => {
            return this.mapToDtoL(locality)
        })
    }
    mapToDtoL(locality : Locality) : LocalityDto{
        return {
            nameLocality: locality.nameLocality,
            idProvince: locality.idProvince,
        }
    }
    //para la parte de provincias
    async createProvince(dto : CreateProvinceDto) : Promise<ProvinceDto>{
        return  this.mapToDtoP( 
            await this.dao.storeP({
                nameProvince:  dto.nameProvince,

            })
        )
    }
    /**
     * Busca a un usuario a partir de una ID. 
     * Tira un ModelNotFoundException si no encuentra a la Entidad 
     * @param id {string} la id  del usuario a buscar
     * @returns {ProvinceDto} el usuario encontrado.
     * @throws {ModelNotFoundException}
     */
    async findProvinceById(id : string) : Promise<ProvinceDto>{
        const province = await this.dao.findByIdP(id)
        return this.mapToDtoP(province)
    }
    async getAllProvinces() : Promise<Array<ProvinceDto>>{
        const province = await this.dao.getAllProvinces()
        return province.map((province: Province) => {
            return this.mapToDtoP(province)
        })
    }
    mapToDtoP(province : Province) : ProvinceDto{
        return {
            nameProvince: province.nameProvince,
        }
    }


}

export const instance = new LocationService(dao.instance)