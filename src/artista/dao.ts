import { ArtistType, ArtistTypeDoc, ArtistTypeModel } from "./modelsType.js"
import { ArtistStyle, ArtistStyleDoc, ArtistStyleModel } from "./modelsStyle.js"
import { ModelNotFoundException } from "../common/exception/exception"
import {StringUtils} from "../common/utils/string_utils"
import { ObjectId } from "mongoose"

/**
 * 
 *  Clase de acceso a los datos. No debemos acoplar las búsquedas  a BBDD en el servicio. 
 *  Los Daos siempre emiten y reciven objetos de negocio (en nuestro caso, ArtistStyle), pero internamente trabajan con
 *  Models de Mongoose. Si , el día de mañana, queremos usar también SQL podemos muy facilmente reemplazar el DAO
 *  sin modificar el servicio.
 * 
 *  Mas info : https://tomanagle.medium.com/strongly-typed-models-with-mongoose-and-typescript-7bc2f7197722
 */
export class ArtistDao {

    async getAllArtistStyles(): Promise<Array<ArtistStyle>> {
        return (await ArtistStyleModel.find({}).exec())
             .map((doc: ArtistStyleDoc) => {
                return this.mapToArtistStyle(doc)
             }
        )
    }

    /**
     * Busca un usuario por su id
     * @param {String} artistStyleId 
     * @returns  {Promise<ArtistStyle>} la instancia de usuario buscada
     * 
     * Nota: El tipo de retorno siempre es una Promise<..>  cuando se usa una funcion
     * async y un await. Ver :
     */
    async findByIdL(artistStyleId: String): Promise<ArtistStyle> {
        const model = await ArtistStyleModel.findById(artistStyleId).exec()
        if (!model) throw new ModelNotFoundException()
        return this.mapToArtistStyle(model)
    }

    async storeL(artistStyle: ArtistStyle): Promise<ArtistStyle> {
        const artistStyleDoc  = await ArtistStyleModel.create(
            {
                nameArtistStyle: artistStyle.nameArtistStyle,
                id: artistStyle.id? StringUtils.toObjectId(artistStyle.id) : undefined,
                idArtistType: artistStyle.idArtistType
            }
        )
        return this.mapToArtistStyle(artistStyleDoc)
    }

    /**
     * Actualiza  todos los campos del usuario menos su password.
     * Se usa en los formularios de editar datos de usuario. 
     * @param {String} artistStyleId 
     * @param {ArtistStyle} artistStyle 
     * @returns {ArtistStyle} the updated ArtistStyle instance with it's id
     */
    async updateArtistStyle(artistStyleId: string, artistStyle: ArtistStyle): Promise<ArtistStyle> {
        const updated = await ArtistStyleModel.findByIdAndUpdate(artistStyleId,{
            nameArtistStyle: artistStyle.nameArtistStyle,
            idArtistType: StringUtils.toObjectId(artistStyle.idArtistType)
        }).exec()
        if (!updated) {
            throw new ModelNotFoundException()
        }
        return this.mapToArtistStyle(updated)
    }


    mapToArtistStyle(document: ArtistStyleDoc): ArtistStyle {
        return {
            nameArtistStyle: document.nameArtistStyle,
           id: document._id as unknown as string,
           idArtistType: document.idArtistType as unknown as string
        }
    }
    //para las provincias
    async getAllArtistTypes(): Promise<Array<ArtistType>> {
        return (await ArtistTypeModel.find({}).exec())
             .map((doc: ArtistTypeDoc) => {
                return this.mapToArtistType(doc)
             }
        )
    }

    /**
     * Busca un usuario por su id
     * @param {String} artistTypeId 
     * @returns  {Promise<ArtistType>} la instancia de usuario buscada
     * 
     * Nota: El tipo de retorno siempre es una Promise<..>  cuando se usa una funcion
     * async y un await. Ver : 
     */
    async findByIdP(artistTypeId: String): Promise<ArtistType> {
        const model = await ArtistTypeModel.findById(artistTypeId).exec()
        if (!model) throw new ModelNotFoundException()
        return this.mapToArtistType(model)
    }

    async storeP(artistType: ArtistType): Promise<ArtistType> {
        const artistTypeDoc  = await ArtistTypeModel.create(
            {
                nameArtistType: artistType.nameArtistType,
                id: artistType.id
            }
        )
        return this.mapToArtistType(artistTypeDoc)
    }

    /**
     * Actualiza  todos los campos del usuario menos su password.
     * Se usa en los formularios de editar datos de usuario. 
     * @param {String} artistTypeId 
     * @param {ArtistType} artistType 
     * @returns {ArtistType} the updated ArtistType instance with it's id
     */
    async updateArtistType(artistTypeId: string, artistType: ArtistType): Promise<ArtistType> {
        const updated = await ArtistTypeModel.findByIdAndUpdate(artistTypeId,{
            nameArtistType: artistType.nameArtistType
        }).exec()
        if (!updated) {
            throw new ModelNotFoundException()
        }
        return this.mapToArtistType(updated)
    }


    mapToArtistType(document: ArtistTypeDoc): ArtistType {
        return {
            nameArtistType: document.nameArtistType,
           id: document._id as unknown as string
        }
    }

}


export const instance = new ArtistDao()