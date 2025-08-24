import  * as dao from "./dao"
import {ArtistStyleDto, ArtistTypeDto} from "./dto"
import {ArtistType} from "./modelsType"
import {ArtistStyle} from "./modelsStyle"

export interface CreateArtistStyleDto {
    nameArtistStyle: string;
    id?: string;
    idArtistType?: string;
}
export interface CreateArtistTypeDto {
    nameArtistType: string;
    id?: string;
}

export class ArtistService{
    /**
     * El dao que usaremos internamente para acceder a la base de datos.
     * @param {dao.ArtistDao} ArtistDao 
     */
    dao : dao.ArtistDao;
    constructor(ArtistDao : dao.ArtistDao){
        this.dao = ArtistDao
    }
    /***
     * Guarda una localidad en la base de datos y retorna la localidad creada
     * TODO : validar
     */
   async createArtistStyle(dto : CreateArtistStyleDto) : Promise<ArtistStyleDto>{
        return  this.mapToDtoL( 
            await this.dao.storeL({
                nameArtistStyle:  dto.nameArtistStyle,
                id: dto.id as unknown as string,
                idArtistType: dto.idArtistType as unknown as string

            })
        )
    }
    /**
     * Busca a una localidad a partir de una ID. 
     * Tira un ModelNotFoundException si no encuentra a la Entidad 
     * @param id {string} la id  del usuario a buscar
     * @returns {ArtistStyleDto} el usuario encontrado.
     * @throws {ModelNotFoundException}
     */
    async findArtistStyleById(id : string) : Promise<ArtistStyleDto>{
        const artistStyle = await this.dao.findByIdL(id)
        return this.mapToDtoL(artistStyle)
    }
    async getAllArtistStyles() : Promise<Array<ArtistStyleDto>>{
        const artistStyle = await this.dao.getAllArtistStyles()
        return artistStyle.map((artistStyle: ArtistStyle) => {
            return this.mapToDtoL(artistStyle)
        })
    }
    mapToDtoL(artistStyle : ArtistStyle) : ArtistStyleDto{
        return {
            nameArtistStyle: artistStyle.nameArtistStyle,
            id: artistStyle.id,
            idArtistType: artistStyle.idArtistType,
        }
    }
    //para la parte de provincias
    async createArtistType(dto : CreateArtistTypeDto) : Promise<ArtistTypeDto>{
        return  this.mapToDtoP( 
            await this.dao.storeP({
                nameArtistType:  dto.nameArtistType,
                id: dto.id as unknown as string

            })
        )
    }
    /**
     * Busca a un usuario a partir de una ID. 
     * Tira un ModelNotFoundException si no encuentra a la Entidad 
     * @param id {string} la id  del usuario a buscar
     * @returns {ArtistTypeDto} el usuario encontrado.
     * @throws {ModelNotFoundException}
     */
    async findArtistTypeById(id : string) : Promise<ArtistTypeDto>{
        const artistType = await this.dao.findByIdP(id)
        return this.mapToDtoP(artistType)
    }
    async getAllArtistTypes() : Promise<Array<ArtistTypeDto>>{
        const artistType = await this.dao.getAllArtistTypes()
        return artistType.map((artistType: ArtistType) => {
            return this.mapToDtoP(artistType)
        })
    }
    mapToDtoP(artistType : ArtistType) : ArtistTypeDto{
        return {
            nameArtistType: artistType.nameArtistType,
            id: artistType.id,
        }
    }


}

export const instance = new ArtistService(dao.instance)