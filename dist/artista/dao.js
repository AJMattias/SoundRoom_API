"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instance = exports.ArtistDao = void 0;
const modelsType_js_1 = require("./modelsType.js");
const modelsStyle_js_1 = require("./modelsStyle.js");
const exception_1 = require("../common/exception/exception");
const string_utils_1 = require("../common/utils/string_utils");
/**
 *
 *  Clase de acceso a los datos. No debemos acoplar las b�squedas  a BBDD en el servicio.
 *  Los Daos siempre emiten y reciven objetos de negocio (en nuestro caso, ArtistStyle), pero internamente trabajan con
 *  Models de Mongoose. Si , el d�a de ma�ana, queremos usar tambi�n SQL podemos muy facilmente reemplazar el DAO
 *  sin modificar el servicio.
 *
 *  Mas info : https://tomanagle.medium.com/strongly-typed-models-with-mongoose-and-typescript-7bc2f7197722
 */
class ArtistDao {
    async getAllArtistStyles() {
        return (await modelsStyle_js_1.ArtistStyleModel.find({}).exec())
            .map((doc) => {
            return this.mapToArtistStyle(doc);
        });
    }
    /**
     * Busca un usuario por su id
     * @param {String} artistStyleId
     * @returns  {Promise<ArtistStyle>} la instancia de usuario buscada
     *
     * Nota: El tipo de retorno siempre es una Promise<..>  cuando se usa una funcion
     * async y un await. Ver :
     */
    async findByIdL(artistStyleId) {
        const model = await modelsStyle_js_1.ArtistStyleModel.findById(artistStyleId).exec();
        if (!model)
            throw new exception_1.ModelNotFoundException();
        return this.mapToArtistStyle(model);
    }
    async storeL(artistStyle) {
        const artistStyleDoc = await modelsStyle_js_1.ArtistStyleModel.create({
            nameArtistStyle: artistStyle.nameArtistStyle,
            id: artistStyle.id ? string_utils_1.StringUtils.toObjectId(artistStyle.id) : undefined,
            idArtistType: artistStyle.idArtistType
        });
        return this.mapToArtistStyle(artistStyleDoc);
    }
    /**
     * Actualiza  todos los campos del usuario menos su password.
     * Se usa en los formularios de editar datos de usuario.
     * @param {String} artistStyleId
     * @param {ArtistStyle} artistStyle
     * @returns {ArtistStyle} the updated ArtistStyle instance with it's id
     */
    async updateArtistStyle(artistStyleId, artistStyle) {
        const updated = await modelsStyle_js_1.ArtistStyleModel.findByIdAndUpdate(artistStyleId, {
            nameArtistStyle: artistStyle.nameArtistStyle,
            idArtistType: string_utils_1.StringUtils.toObjectId(artistStyle.idArtistType)
        }).exec();
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToArtistStyle(updated);
    }
    mapToArtistStyle(document) {
        return {
            nameArtistStyle: document.nameArtistStyle,
            id: document._id,
            idArtistType: document.idArtistType
        };
    }
    //para las provincias
    async getAllArtistTypes() {
        return (await modelsType_js_1.ArtistTypeModel.find({}).exec())
            .map((doc) => {
            return this.mapToArtistType(doc);
        });
    }
    /**
     * Busca un usuario por su id
     * @param {String} artistTypeId
     * @returns  {Promise<ArtistType>} la instancia de usuario buscada
     *
     * Nota: El tipo de retorno siempre es una Promise<..>  cuando se usa una funcion
     * async y un await. Ver :
     */
    async findByIdP(artistTypeId) {
        const model = await modelsType_js_1.ArtistTypeModel.findById(artistTypeId).exec();
        if (!model)
            throw new exception_1.ModelNotFoundException();
        return this.mapToArtistType(model);
    }
    async storeP(artistType) {
        const artistTypeDoc = await modelsType_js_1.ArtistTypeModel.create({
            nameArtistType: artistType.nameArtistType,
            id: artistType.id
        });
        return this.mapToArtistType(artistTypeDoc);
    }
    /**
     * Actualiza  todos los campos del usuario menos su password.
     * Se usa en los formularios de editar datos de usuario.
     * @param {String} artistTypeId
     * @param {ArtistType} artistType
     * @returns {ArtistType} the updated ArtistType instance with it's id
     */
    async updateArtistType(artistTypeId, artistType) {
        const updated = await modelsType_js_1.ArtistTypeModel.findByIdAndUpdate(artistTypeId, {
            nameArtistType: artistType.nameArtistType
        }).exec();
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToArtistType(updated);
    }
    mapToArtistType(document) {
        return {
            nameArtistType: document.nameArtistType,
            id: document._id
        };
    }
}
exports.ArtistDao = ArtistDao;
exports.instance = new ArtistDao();
