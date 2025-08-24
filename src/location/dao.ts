import {Province, ProvinceDoc, ProvinceModel } from "./models.js"
import { Locality, LocalityDoc, LocalityModel} from "./modelsL.js"
import { ModelNotFoundException } from "../common/exception/exception"
import {StringUtils} from "../common/utils/string_utils"
import { ObjectId } from "mongoose"

/**
 * 
 *  Clase de acceso a los datos. No debemos acoplar las búsquedas  a BBDD en el servicio. 
 *  Los Daos siempre emiten y reciven objetos de negocio (en nuestro caso, Locality), pero internamente trabajan con
 *  Models de Mongoose. Si , el día de mañana, queremos usar también SQL podemos muy facilmente reemplazar el DAO
 *  sin modificar el servicio.
 * 
 *  Mas info : https://tomanagle.medium.com/strongly-typed-models-with-mongoose-and-typescript-7bc2f7197722
 */
export class LocationDao {

    async getAllLocalities(): Promise<Array<Locality>> {
        return (await LocalityModel.find({}).exec())
             .map((doc: LocalityDoc) => {
                return this.mapToLocality(doc)
             }
        )
    }

    /**
     * Busca un usuario por su id
     * @param {String} localityId 
     * @returns  {Promise<Locality>} la instancia de usuario buscada
     * 
     * Nota: El tipo de retorno siempre es una Promise<..>  cuando se usa una funcion
     * async y un await. Ver :
     */
    async findByIdL(localityId: String): Promise<Locality> {
        const model = await LocalityModel.findById(localityId).exec()
        if (!model) throw new ModelNotFoundException()
        return this.mapToLocality(model)
    }

    async storeL(locality: Locality): Promise<Locality> {
        const localityDoc  = await LocalityModel.create(
            {
                nameLocality: locality.nameLocality,
                idProvince: locality.idProvince
            }
        )
        return this.mapToLocality(localityDoc)
    }

    async updateL(id: string, locality: Locality): Promise<Locality> {
        const model = await LocalityModel.findById(id).exec()
        //if(model.idProvince != locality.idProvince)
        const updated  = await LocalityModel.findByIdAndUpdate(id,{
            nameLocality: locality.nameLocality
        }).exec()
        if (!updated) {
            throw new ModelNotFoundException()
        }
        return this.mapToLocality(updated)
    }
    /**
     * Actualiza  todos los campos del usuario menos su password.
     * Se usa en los formularios de editar datos de usuario. 
     * @param {String} localityId 
     * @param {Locality} locality 
     * @returns {Locality} the updated Locality instance with it's id
     */
    async updateLocality(localityId: string, locality: Locality): Promise<Locality> {
        const updated = await LocalityModel.findByIdAndUpdate(localityId,{
            nameLocality: locality.nameLocality,
            idProvince: StringUtils.toObjectId(locality.idProvince)
        }).exec()
        if (!updated) {
            throw new ModelNotFoundException()
        }
        return this.mapToLocality(updated)
    }


    mapToLocality(document: LocalityDoc): Locality {
        return {
           nameLocality: document.nameLocality,
           idProvince: document.idProvince as unknown as string
        }
    }
    //para las provincias
    async getAllProvinces(): Promise<Array<Province>> {
        return (await ProvinceModel.find({}).exec())
             .map((doc: ProvinceDoc) => {
                return this.mapToProvince(doc)
             }
        )
    }

    /**
     * Busca un usuario por su id
     * @param {String} provinceId 
     * @returns  {Promise<Province>} la instancia de usuario buscada
     * 
     * Nota: El tipo de retorno siempre es una Promise<..>  cuando se usa una funcion
     * async y un await. Ver : 
     */
    async findByIdP(provinceId: String): Promise<Province> {
        const model = await ProvinceModel.findById(provinceId).exec()
        if (!model) throw new ModelNotFoundException()
        return this.mapToProvince(model)
    }

    async storeP(province: Province): Promise<Province> {
        console.log(province.nameProvince)
        const provinceDoc  = await ProvinceModel.create(
            {
                nameProvince: province.nameProvince
            }
        )
        return this.mapToProvince(provinceDoc)
    }

    /**
     * Actualiza  todos los campos del usuario menos su password.
     * Se usa en los formularios de editar datos de usuario. 
     * @param {String} provinceId 
     * @param {Province} province 
     * @returns {Province} the updated Province instance with it's id
     */
    async updateProvince(provinceId: string, province: Province): Promise<Province> {
        const updated = await ProvinceModel.findByIdAndUpdate(provinceId,{
            nameProvince: province.nameProvince
        }).exec()
        if (!updated) {
            throw new ModelNotFoundException()
        }
        return this.mapToProvince(updated)
    }


    mapToProvince(document: ProvinceDoc): Province {
        return {
            nameProvince: document.nameProvince
        }
    }

}

/**
 *  Esto nos permite hacer un patrón Singleton en JavaScript. Esto quiere decir que en cada Servicio, en vez 
 *  de crear una instancia nueva de LocationDao por cada request del usuario , vamos a reutilizar esta instancia "instance"
 *  ya creada.
 */
export const instance = new LocationDao()