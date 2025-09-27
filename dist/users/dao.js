"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instance = exports.UsersDao = void 0;
const models_js_1 = require("./models.js");
const exception_1 = require("../common/exception/exception");
const string_utils_1 = require("../common/utils/string_utils");
const modelEU_1 = require("./modelEU");
var mongoose = require('mongoose');
/**
 *
 *  Clase de acceso a los datos. No debemos acoplar las búsquedas  a BBDD en el servicio.
 *  Los Daos siempre emiten y reciven objetos de negocio (en nuestro caso, User), pero internamente trabajan con
 *  Models de Mongoose. Si , el día de mañana, queremos usar también SQL podemos muy facilmente reemplazar el DAO
 *  sin modificar el servicio.
 *
 *  Mas info : https://tomanagle.medium.com/strongly-typed-models-with-mongoose-and-typescript-7bc2f7197722
 */
class UsersDao {
    async getAll() {
        return (await models_js_1.UserModel.find({ "isAdmin": false }).populate("idPerfil").exec())
            .map((doc) => {
            return this.mapToUser(doc);
        });
    }
    async getAllUA() {
        return (await models_js_1.UserModel.find().exec())
            .map((doc) => {
            return this.mapToUser(doc);
        });
    }
    async getAllUserPerfilPermiso() {
        return (await models_js_1.UserModel.find({ "isAdmin": false })
            .populate('perfil')
            .populate({ path: 'perfil.permisos', model: 'Permiso' })
            .exec())
            .map((doc) => {
            return this.mapToUser(doc);
        });
    }
    /**
     * Busca un usuario por su id
     * @param {String} userId
     * @returns  {Promise<User>} la instancia de usuario buscada
     *
     * Nota: El tipo de retorno siempre es una Promise<..>  cuando se usa una funcion
     * async y un await. Ver :
     */
    async findById(userId) {
        const model = await models_js_1.UserModel.findById(userId).populate('idPerfil').exec();
        if (!model)
            throw new exception_1.ModelNotFoundException();
        return this.mapToUser(model);
    }
    async findUsersBetwenDates(fechaI, fechaH) {
        return (await models_js_1.UserModel.find({
            createdAt: {
                $gte: fechaI,
                $lte: fechaH
            }
        }).exec())
            .map((doc) => {
            return this.mapToUser(doc);
        });
    }
    /**
     *  Busca un usuario por email
     * @param {String} email
     * @returns {models.User}
     */
    async findByEmail(mail) {
        console.log(' dao login fidByEmail - email, password: ', mail);
        const model = await models_js_1.UserModel.findOne({ "email": mail, enabled: "habilitado" }).populate('idPerfil').exec();
        console.log('dao findByEmail: ', model);
        if (!model)
            throw new exception_1.ModelNotFoundException();
        return this.mapToUser(model);
    }
    /**
     *  Guarda un usuario en la base de datos
     *  @param {User} user  el usuario a guardar.
     *  @returns {ObjectId} el ObjectId del documento guardado.
     *
     */
    async store(user) {
        const enabledHistoryEntry = {
            status: "habilitado",
            dateFrom: new Date(),
            dateTo: null,
        };
        const userDoc = await models_js_1.UserModel.create({
            name: user.name,
            email: user.email,
            lastName: user.last_name,
            password: user.password,
            image_id: user.image_id,
            createdAt: new Date(),
            userType: user.userType,
            ...(user.idPerfil && { idPerfil: user.idPerfil }),
            //idPerfil: user.idPerfil,
            idArtistType: user.idArtistType,
            idArtistStyle: user.idArtistStyle,
            isAdmin: false,
            enabled: "habilitado",
            enabledHistory: [enabledHistoryEntry],
        });
        return this.mapToUser(userDoc);
    }
    async storetwo(usertwo) {
        const userDoc = await models_js_1.UserModel.create({
            name: usertwo.name,
            email: usertwo.email,
            lastName: usertwo.last_name,
            password: usertwo.password,
            image_id: usertwo.image_id,
            createdAt: new Date(),
        });
        return this.mapToUser(userDoc);
    }
    /**
     * Actualiza  todos los campos del usuario menos su password.
     * Se usa en los formularios de editar datos de usuario.
     * @param {String} userId
     * @param {User} user
     * @returns {User} the updated User instance with it's id
     */
    //  idPerfil: (user.idPerfil != null)? StringUtils.toObjectId(user.idPerfil) : undefined, 
    async updateUser(userId, user) {
        console.log('dao update user to update: ', user);
        const newId = String(userId);
        //const query = { id: StringUtils.toObjectId(userId) };
        const query = { id: mongoose.Types.ObjectId(userId) };
        const idUser = mongoose.Types.ObjectId(userId);
        //atributos a actualizar : name:  dto.name,
        const perfilId = mongoose.Types.ObjectId(user.idPerfil);
        const userToUpdate = await models_js_1.UserModel.findById(userId);
        if (!userToUpdate) {
            throw new Error;
        }
        // last_name : dto.last_name,
        // email: dto.email,
        // password : dto.password,
        // createdAt: dto.createdAt,
        // deletedAt: dto.deletedAt,
        // image_id: undefined,
        // enabled: dto.enabled,
        // idPerfil: dto.idPerfil,
        // idArtistType: dto.idArtistType as unknown as string,
        // idArtistStyle: dto.idArtistStyle as unknown as string,
        // userType: dto.userType,
        // idSalaDeEnsayo: dto.idSalaDeEnsayo
        const updated = await models_js_1.UserModel.findOneAndUpdate({ _id: idUser }, {
            $set: {
                name: user.name,
                lastName: user.last_name,
                email: user.email,
                enabled: user.enabled,
                tipoArtista: user.tipoArtista,
                createdAt: user.createdAt,
                deletedAt: user.deletedAt,
                idPerfil: perfilId,
                password: user.password,
                enabledHistory: userToUpdate.enabledHistory,
            }
            //password tb?
            //idPerfil: StringUtils.toObjectId(user.idPerfil)}, 
            //idArtistType: (user.idArtistType != null)? StringUtils.toObjectId(user.idArtistType) : undefined,
        }, { new: true }
        /*
        *idPerfil: user.idPerfil,idPerfil: (user.idPerfil != null)? StringUtils.toObjectId(user.idPerfil) : undefined,
        *
         
        * idArtistStyle: (user.idArtistStyle != null)? StringUtils.toObjectId(user.idArtistStyle) : undefined,
        * image_id: user.image_id? StringUtils.toObjectId(user.image_id) : undefined
        */
        ).exec();
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        console.log(updated);
        return this.mapToUser(updated);
    }
    async updateUserTwo(userId, user) {
        console.log('dao update user to update: ', user);
        const updated = await models_js_1.UserModel.findByIdAndUpdate(userId, {
            name: user.name,
            lastName: user.last_name,
            email: user.email,
            enabled: user.enabled,
            tipoArtista: user.tipoArtista,
            createdAt: user.createdAt,
            deletedAt: user.deletedAt
        }, { new: true }).exec();
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        console.log(updated);
        return this.mapToUser(updated);
    }
    async updateIdPerfil(userId, user) {
        if (!user.idPerfil) {
            throw new Error('idPerfil es requerido');
        }
        const idPerfil2 = string_utils_1.StringUtils.toObjectId(user.idPerfil);
        const updated = await models_js_1.UserModel.findByIdAndUpdate(userId, {
            name: user.name,
            lastName: user.last_name,
            email: user.email,
            enabled: user.enabled,
            idPerfil: idPerfil2,
            createdAt: user.createdAt,
            /*
            *idPerfil: user.idPerfil,
            * idPerfil: (user.idPerfil != null)? StringUtils.toObjectId(user.idPerfil) : undefined,
            * idArtistType: (user.idArtistType != null)? StringUtils.toObjectId(user.idArtistType) : undefined,
            * idArtistStyle: (user.idArtistStyle != null)? StringUtils.toObjectId(user.idArtistStyle) : undefined,
            * image_id: user.image_id? StringUtils.toObjectId(user.image_id) : undefined
            */
        }).exec();
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToUser(updated);
    }
    //TODO: test it
    async updateUserSalas(userId, nuevaIdSala) {
        const updated = await models_js_1.UserModel.findByIdAndUpdate(userId, {
            $push: { idSalaDeEnsayo: nuevaIdSala }
        }).exec();
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToUser(updated);
    }
    async disableUser(userId, user) {
        // const query = {user: user.email};
        //const updated = await UserModel.findOneAndUpdate({user: user.email}, {enabled: false})
        const updated = await models_js_1.UserModel.findByIdAndUpdate(userId, {
            name: user.name,
            lastName: user.last_name,
            email: user.email,
            enabled: "deshabilitado",
            createdAt: user.createdAt,
            deletedAt: user.deletedAt,
            $push: { enabledHistory: { status: 'deshabilitado', dateFrom: new Date() } },
        }, { new: true } // Esto es opcional, pero si se establece en true, devuelve el documento actualizado
        );
        // const updated = await UserModel.findByIdAndUpdate(userId,{
        //     name: user.name,
        //     lastName: user.last_name,
        //     email: user.email,
        //     enabled: false
        // }).exec()
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToUser(updated);
    }
    async enabledUser(userId, user) {
        // const query = {user: user.email};
        //const updated = await UserModel.findOneAndUpdate({user: user.email}, {enabled: false})
        const updated = await models_js_1.UserModel.findByIdAndUpdate(userId, {
            name: user.name,
            lastName: user.last_name,
            email: user.email,
            enabled: "habilitado",
            createdAt: user.createdAt,
            deletedAt: user.deletedAt,
            $push: { enabledHistory: { status: 'habilitado', dateFrom: new Date() } },
        }, { new: true } // Esto es opcional, pero si se establece en true, devuelve el documento actualizado
        );
        // const updated = await UserModel.findByIdAndUpdate(userId,{
        //     name: user.name,
        //     lastName: user.last_name,
        //     email: user.email,
        //     enabled: false
        // }).exec()
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToUser(updated);
    }
    async bajaUser(userId, user) {
        console.log("dao baja:", user.enabled);
        //buscar
        //toUpdated.enabled = "baja"
        const updated = await models_js_1.UserModel.findByIdAndUpdate(userId, {
            name: user.name,
            lastName: user.last_name,
            email: user.email,
            enabled: "baja",
            createdAt: user.createdAt,
            deletedAt: user.deletedAt,
            $push: { enabledHistory: { status: 'baja', dateFrom: new Date() } },
        }, { new: true } // Esto es opcional, pero si se establece en true, devuelve el documento actualizado
        );
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToUser(updated);
    }
    async stopDisableUser(userId) {
        //version anterior, funcionaba, se actualizo mongodb
        // y ya no funciona mas:
        console.log('userId: ', userId);
        console.log('stop disable user');
        const idUser = mongoose.Types.ObjectId(userId);
        const updated = await models_js_1.UserModel.findOneAndUpdate({ _id: idUser, "enabledHistory.dateTo": null }, { $set: { "enabledHistory.$.dateTo": new Date() } }, { new: true });
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToUser(updated);
        //nueva version: const idUser = new mongoose.Types.ObjectId(userId);
        // Encuentra el usuario
        // const user = await UserModel.findOne({ _id: userId });
        // if (!user) {
        //     throw new ModelNotFoundException();
        // }
        // // Encuentra el elemento en enabledHistory con dateTo igual a null
        // const historyEntry = user.enabledHistory.find(entry => entry.dateTo === null);
        // if (historyEntry) {
        //     // Actualiza el campo dateTo a la fecha actual
        //     historyEntry.dateTo = new Date();
        //     await user.save();  // Guarda los cambios en la base de datos
        // } else {
        //     throw new Error('No se encontró un elemento con dateTo igual a null en enabledHistory');
        // }
        // return this.mapToUser(user);
    }
    async stopBajaUser(userId) {
        const updated = await models_js_1.UserModel.findOneAndUpdate({ _id: userId, "enabledHistory.dateTo": null }, { $set: { "enabledHistory.$.dateTo": new Date() } });
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToUser(updated);
    }
    /**
     *  Cambia la contraseña de un usuario.
     * @param {String} userId
     * @param {String} newPassword
     * @returns {User} la instancia de User actualizada con su id
     */
    async updatePassword(userId, newPassword) {
        const updated = await models_js_1.UserModel.findByIdAndUpdate(userId, {
            password: newPassword
        }).exec();
        if (!updated)
            throw new exception_1.ModelNotFoundException();
        return this.mapToUser(updated);
    }
    mapToUser(document) {
        return {
            name: document.name,
            lastName: document.lastName,
            password: document.password,
            createdAt: document.createdAt,
            deletedAt: document.deletedAt,
            email: document.email,
            idPerfil: document.idPerfil,
            idArtistType: document.idArtistType,
            idArtistStyle: document.idArtistStyle,
            idSalaDeEnsayo: document.idSalaDeEnsayo,
            id: document._id,
            isAdmin: document.isAdmin,
            estadoUsuario: document.estadoUsuario,
            enabled: document.enabled,
            userType: document.userType,
            tipoArtista: document.tipoArtista,
            opiniones: document.opiniones,
            enabledHistory: document.enabledHistory
        };
    }
    mapToEstadoUsuario(document) {
        return {
            id: document.id,
            createdAt: document.createdAt,
            deletedAt: document.deletedAt,
            estado: document.estado
        };
    }
    async getAllEstadosUsers() {
        return (await modelEU_1.EstadoUsuarioModel.find({}).exec())
            .map((doc) => {
            return this.mapToEstadoUsuario(doc);
        });
    }
    async findEstadoById(estadoId) {
        const model = await modelEU_1.EstadoUsuarioModel.findById(estadoId).exec();
        if (!model)
            throw new exception_1.ModelNotFoundException();
        return this.mapToEstadoUsuario(model);
    }
    /**
     *  Esto nos permite hacer un patrón Singleton en JavaScript. Esto quiere decir que en cada Servicio, en vez
     *  de crear una instancia nueva de UsersDao por cada request del usuario , vamos a reutilizar esta instancia "instance"
     *  ya creada.
     */
    async getUserByDateRange(fechaInicial, fechaHasta) {
        const fechaI = new Date(fechaInicial);
        const fechaF = new Date(fechaHasta);
        return (await models_js_1.UserModel.find({
            createdAt: {
                $gte: fechaInicial,
                $lte: fechaHasta
            }
        }).exec())
            .map((doc) => {
            return this.mapToUser(doc);
        });
    }
}
exports.UsersDao = UsersDao;
//
//
// Estado Usuario
//
//
exports.instance = new UsersDao();
