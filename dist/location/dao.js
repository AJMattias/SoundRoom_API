"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instance = exports.LocationDao = void 0;
const models_js_1 = require("./models.js");
const modelsL_js_1 = require("./modelsL.js");
const exception_1 = require("../common/exception/exception");
const string_utils_1 = require("../common/utils/string_utils");
/**
 *
 *  Clase de acceso a los datos. No debemos acoplar las b�squedas  a BBDD en el servicio.
 *  Los Daos siempre emiten y reciven objetos de negocio (en nuestro caso, Locality), pero internamente trabajan con
 *  Models de Mongoose. Si , el d�a de ma�ana, queremos usar tambi�n SQL podemos muy facilmente reemplazar el DAO
 *  sin modificar el servicio.
 *
 *  Mas info : https://tomanagle.medium.com/strongly-typed-models-with-mongoose-and-typescript-7bc2f7197722
 */
class LocationDao {
    async getAllLocalities() {
        return (await modelsL_js_1.LocalityModel.find({}).exec())
            .map((doc) => {
            return this.mapToLocality(doc);
        });
    }
    /**
     * Busca un usuario por su id
     * @param {String} localityId
     * @returns  {Promise<Locality>} la instancia de usuario buscada
     *
     * Nota: El tipo de retorno siempre es una Promise<..>  cuando se usa una funcion
     * async y un await. Ver :
     */
    async findByIdL(localityId) {
        const model = await modelsL_js_1.LocalityModel.findById(localityId).exec();
        if (!model)
            throw new exception_1.ModelNotFoundException();
        return this.mapToLocality(model);
    }
    async storeL(locality) {
        const localityDoc = await modelsL_js_1.LocalityModel.create({
            nameLocality: locality.nameLocality,
            idProvince: locality.idProvince
        });
        return this.mapToLocality(localityDoc);
    }
    async updateL(id, locality) {
        const model = await modelsL_js_1.LocalityModel.findById(id).exec();
        //if(model.idProvince != locality.idProvince)
        const updated = await modelsL_js_1.LocalityModel.findByIdAndUpdate(id, {
            nameLocality: locality.nameLocality
        }).exec();
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToLocality(updated);
    }
    /**
     * Actualiza  todos los campos del usuario menos su password.
     * Se usa en los formularios de editar datos de usuario.
     * @param {String} localityId
     * @param {Locality} locality
     * @returns {Locality} the updated Locality instance with it's id
     */
    async updateLocality(localityId, locality) {
        const updated = await modelsL_js_1.LocalityModel.findByIdAndUpdate(localityId, {
            nameLocality: locality.nameLocality,
            idProvince: string_utils_1.StringUtils.toObjectId(locality.idProvince)
        }).exec();
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToLocality(updated);
    }
    mapToLocality(document) {
        return {
            nameLocality: document.nameLocality,
            idProvince: document.idProvince
        };
    }
    //para las provincias
    async getAllProvinces() {
        return (await models_js_1.ProvinceModel.find({}).exec())
            .map((doc) => {
            return this.mapToProvince(doc);
        });
    }
    /**
     * Busca un usuario por su id
     * @param {String} provinceId
     * @returns  {Promise<Province>} la instancia de usuario buscada
     *
     * Nota: El tipo de retorno siempre es una Promise<..>  cuando se usa una funcion
     * async y un await. Ver :
     */
    async findByIdP(provinceId) {
        const model = await models_js_1.ProvinceModel.findById(provinceId).exec();
        if (!model)
            throw new exception_1.ModelNotFoundException();
        return this.mapToProvince(model);
    }
    async storeP(province) {
        console.log(province.nameProvince);
        const provinceDoc = await models_js_1.ProvinceModel.create({
            nameProvince: province.nameProvince
        });
        return this.mapToProvince(provinceDoc);
    }
    /**
     * Actualiza  todos los campos del usuario menos su password.
     * Se usa en los formularios de editar datos de usuario.
     * @param {String} provinceId
     * @param {Province} province
     * @returns {Province} the updated Province instance with it's id
     */
    async updateProvince(provinceId, province) {
        const updated = await models_js_1.ProvinceModel.findByIdAndUpdate(provinceId, {
            nameProvince: province.nameProvince
        }).exec();
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToProvince(updated);
    }
    mapToProvince(document) {
        return {
            nameProvince: document.nameProvince
        };
    }
}
exports.LocationDao = LocationDao;
/**
 *  Esto nos permite hacer un patr�n Singleton en JavaScript. Esto quiere decir que en cada Servicio, en vez
 *  de crear una instancia nueva de LocationDao por cada request del usuario , vamos a reutilizar esta instancia "instance"
 *  ya creada.
 */
exports.instance = new LocationDao();
