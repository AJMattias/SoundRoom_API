import { User, UserDoc, UserModel } from "./models.js"
import { ModelNotFoundException } from "../common/exception/exception"
import {StringUtils} from "../common/utils/string_utils"
import { ObjectId } from "mongoose"
import { CreateUserDto } from "./dto"
import { CreateUserDtoTwo } from "./dto"
import { EstadoUsuario, EstadoUsuarioDoc, EstadoUsuarioModel } from "./modelEU"
import { createEstadoUsuarioDto } from "./dtoEstado.js"
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
export class UsersDao {

    async getAll(): Promise<Array<User>> {
        return (await UserModel.find({"isAdmin": false}).exec())
         .map((doc: UserDoc) => {
            return this.mapToUser(doc)
            }
        )
    }

    async getAllUA(): Promise<Array<User>> {
        return (await UserModel.find().exec())
         .map((doc: UserDoc) => {
            return this.mapToUser(doc)
            }
        )
    }

    async getAllUserPerfilPermiso(): Promise<Array<User>> {
        return (await UserModel.find({"isAdmin": false})
        .populate('perfil')
        .populate({path:'perfil.permisos', model: 'Permiso'})
        .exec())
         .map((doc: UserDoc) => {
            return this.mapToUser(doc)
            }
        )
    }

    /**
     * Busca un usuario por su id
     * @param {String} userId 
     * @returns  {Promise<User>} la instancia de usuario buscada
     * 
     * Nota: El tipo de retorno siempre es una Promise<..>  cuando se usa una funcion
     * async y un await. Ver :
     */
    async findById(userId: String): Promise<User> {

        const model = await UserModel.findById(userId).populate('idPerfil').exec()
        if (!model) throw new ModelNotFoundException()
        return this.mapToUser(model)
    }

    async findUsersBetwenDates(fechaI: Date,  fechaH: Date): Promise<Array<User>> {
       return(await UserModel.find({
            createdAt: {
              $gte: fechaI,
              $lte: fechaH
            }}).exec())
            .map((doc: UserDoc) => {
                return this.mapToUser(doc)
                }
            )
    }

    /**
     *  Busca un usuario por email
     * @param {String} email 
     * @returns {models.User}
     */
    async findByEmail(mail: string): Promise<User> {
        const model = await UserModel.findOne({ "email": mail, enabled: "habilitado" }).populate('idPerfil').exec()
        if (!model) throw new ModelNotFoundException()
        return this.mapToUser(model)
    }

    /**
     *  Guarda un usuario en la base de datos
     *  @param {User} user  el usuario a guardar.
     *  @returns {ObjectId} el ObjectId del documento guardado.
     *   
     */
    async store(user: CreateUserDto): Promise<User> {
        const enabledHistoryEntry = {
            status: "habilitado",
            dateFrom: new Date(),
            dateTo: null,
        };
        const userDoc  = await UserModel.create(
            {
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
            }
        )
        return this.mapToUser(userDoc)
    }
    async storetwo(usertwo: CreateUserDtoTwo): Promise<User> {
        const userDoc  = await UserModel.create(
            {
                name: usertwo.name,
                email: usertwo.email,
                lastName: usertwo.last_name,
                password: usertwo.password,
                image_id: usertwo.image_id,
                createdAt: new Date(),
            }
        )
        return this.mapToUser(userDoc)
    }

    /**
     * Actualiza  todos los campos del usuario menos su password.
     * Se usa en los formularios de editar datos de usuario. 
     * @param {String} userId 
     * @param {User} user 
     * @returns {User} the updated User instance with it's id
     */

    //  idPerfil: (user.idPerfil != null)? StringUtils.toObjectId(user.idPerfil) : undefined, 

    async updateUser(userId: string, user: CreateUserDto): Promise<User> {
        console.log('dao update user to update: ', user)
        const newId = String(userId)
        //const query = { id: StringUtils.toObjectId(userId) };
        const query = { id: mongoose.Types.ObjectId(userId) };
        const idUser = mongoose.Types.ObjectId(userId);
        //atributos a actualizar : name:  dto.name,
        const perfilId = mongoose.Types.ObjectId(user.idPerfil)

        const userToUpdate = await UserModel.findById(userId)

        if(!userToUpdate){
            throw new Error
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
        const updated = await UserModel.findOneAndUpdate(
            {_id: idUser},
            {
                $set:{
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
        },
            {new: true}
            /*
            *idPerfil: user.idPerfil,idPerfil: (user.idPerfil != null)? StringUtils.toObjectId(user.idPerfil) : undefined,
            * 
             
            * idArtistStyle: (user.idArtistStyle != null)? StringUtils.toObjectId(user.idArtistStyle) : undefined,
            * image_id: user.image_id? StringUtils.toObjectId(user.image_id) : undefined
            */
           
        ).exec()
        if (!updated) {
            throw new ModelNotFoundException()
        }
        console.log(updated)
        return this.mapToUser(updated)
    
    }
    async updateUserTwo(userId: string, user: CreateUserDto): Promise<User> {
        console.log('dao update user to update: ', user)

        const updated = await UserModel.findByIdAndUpdate(userId,{
            name: user.name,
            lastName: user.last_name,
            email: user.email,
            enabled: user.enabled,
            tipoArtista: user.tipoArtista,
            createdAt: user.createdAt,
            deletedAt: user.deletedAt
        },
            {new: true}
        ).exec()
        if (!updated) {
            throw new ModelNotFoundException()
        }
        console.log(updated)
        return this.mapToUser(updated)
    
    }

    async updateIdPerfil(userId: string, user: CreateUserDto): Promise<User> {
        if (!user.idPerfil) {
            throw new Error('idPerfil es requerido');
        }
        const idPerfil2 = StringUtils.toObjectId(user.idPerfil)
        const updated = await UserModel.findByIdAndUpdate(userId,{
            name: user.name,
            lastName: user.last_name,
            email: user.email,
            enabled: user.enabled,
            idPerfil: idPerfil2,
            createdAt:user.createdAt,
            /*
            *idPerfil: user.idPerfil,
            * idPerfil: (user.idPerfil != null)? StringUtils.toObjectId(user.idPerfil) : undefined,
            * idArtistType: (user.idArtistType != null)? StringUtils.toObjectId(user.idArtistType) : undefined,
            * idArtistStyle: (user.idArtistStyle != null)? StringUtils.toObjectId(user.idArtistStyle) : undefined,
            * image_id: user.image_id? StringUtils.toObjectId(user.image_id) : undefined
            */
            
        }).exec()
        if (!updated) {
            throw new ModelNotFoundException()
        }
        return this.mapToUser(updated)
    }

    //TODO: test it
    async updateUserSalas(userId: string, nuevaIdSala: string): Promise<User> {
        const updated = await UserModel.findByIdAndUpdate(userId,{
            $push:{idSalaDeEnsayo: nuevaIdSala}
            
        }).exec()
        if (!updated) {
            throw new ModelNotFoundException()
        }
        return this.mapToUser(updated)
    }

    async disableUser(userId: string, user: CreateUserDto): Promise<User> {
        // const query = {user: user.email};
        //const updated = await UserModel.findOneAndUpdate({user: user.email}, {enabled: false})
        const updated = await UserModel.findByIdAndUpdate(userId, {
            name: user.name,
            lastName: user.last_name,
            email: user.email,
            enabled: "deshabilitado",
            createdAt:user.createdAt,
            deletedAt: user.deletedAt,
            $push: { enabledHistory: { status: 'deshabilitado', dateFrom: new Date() } },
        },{ new: true } // Esto es opcional, pero si se establece en true, devuelve el documento actualizado
        )
        // const updated = await UserModel.findByIdAndUpdate(userId,{
        //     name: user.name,
        //     lastName: user.last_name,
        //     email: user.email,
        //     enabled: false
        // }).exec()
        
        if (!updated) {
            throw new ModelNotFoundException()}
        return this.mapToUser(updated)
        
    }

     async enabledUser(userId: string, user: CreateUserDto): Promise<User> {
        // const query = {user: user.email};
         //const updated = await UserModel.findOneAndUpdate({user: user.email}, {enabled: false})
         const updated = await UserModel.findByIdAndUpdate(userId, {
             name: user.name,
             lastName: user.last_name,
             email: user.email,
             enabled: "habilitado",
             createdAt:user.createdAt,
             deletedAt: user.deletedAt,
             $push: { enabledHistory: { status: 'habilitado', dateFrom: new Date() } },
         },{ new: true } // Esto es opcional, pero si se establece en true, devuelve el documento actualizado
         )
         // const updated = await UserModel.findByIdAndUpdate(userId,{
         //     name: user.name,
         //     lastName: user.last_name,
         //     email: user.email,
         //     enabled: false
         // }).exec()
         if (!updated) {
             throw new ModelNotFoundException()
         }
         return this.mapToUser(updated)
     }

     async bajaUser(userId: string, user: CreateUserDto): Promise<User> {
        console.log("dao baja:", user.enabled)
        //buscar
        //toUpdated.enabled = "baja"
        const updated = await UserModel.findByIdAndUpdate(userId,{
            name: user.name,
            lastName: user.last_name,
            email: user.email,
            enabled: "baja",
            createdAt:user.createdAt,
            deletedAt: user.deletedAt,
            $push: { enabledHistory: { status: 'baja', dateFrom: new Date() } },
        },{ new: true } // Esto es opcional, pero si se establece en true, devuelve el documento actualizado
        )
        if (!updated) {
            throw new ModelNotFoundException()
        }
        return this.mapToUser(updated)
     }


     async stopDisableUser(userId: string): Promise<User> {
        //version anterior, funcionaba, se actualizo mongodb
        // y ya no funciona mas:

        console.log('stop disable user')
        const idUser = mongoose.Types.ObjectId(userId);
         const updated = await UserModel.findOneAndUpdate(
            { _id: idUser, "enabledHistory.dateTo": null },
            { $set: { "enabledHistory.$.dateTo": new Date() } },
            {new: true}
        );
         
         if (!updated) {
             throw new ModelNotFoundException()
         }
         return this.mapToUser(updated)

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
     

     async stopBajaUser(userId: string): Promise<User> {
         const updated = await UserModel.findOneAndUpdate(
            { _id: userId, "enabledHistory.dateTo": null },
            { $set: { "enabledHistory.$.dateTo": new Date() } }
        );
         
         if (!updated) {
             throw new ModelNotFoundException()
         }
         return this.mapToUser(updated)
     }
 

    /**
     *  Cambia la contraseña de un usuario.
     * @param {String} userId 
     * @param {String} newPassword 
     * @returns {User} la instancia de User actualizada con su id
     */
    async updatePassword(userId: string, newPassword: string): Promise<User> {
        const updated = await UserModel.findByIdAndUpdate(userId, {
            password: newPassword
        }).exec()
        if (!updated) throw new ModelNotFoundException()
        return this.mapToUser(updated)
    }

    mapToUser(document: UserDoc): User {
        return {
            name: document.name,
            lastName: document.lastName,
            password: document.password,
            createdAt: document.createdAt,
            deletedAt: document.deletedAt,
            email: document.email,
            idPerfil: document.idPerfil as unknown as string,
            idArtistType: document.idArtistType as unknown as string,
            idArtistStyle: document.idArtistStyle as unknown as string,
            idSalaDeEnsayo: document.idSalaDeEnsayo,
            id: document._id,
            isAdmin: document.isAdmin,
            estadoUsuario:document.estadoUsuario,
            enabled: document.enabled,
            userType: document.userType,
            tipoArtista: document.tipoArtista,
            opiniones: document.opiniones,
            enabledHistory: document.enabledHistory
        }
    }

    mapToEstadoUsuario(document: EstadoUsuarioDoc): EstadoUsuario {
        return {
            id: document.id,
            createdAt: document.createdAt,
            deletedAt: document.deletedAt,
            estado: document.estado
 
        }
    }

    async getAllEstadosUsers(): Promise<Array<EstadoUsuario>> {
        return (await EstadoUsuarioModel.find({}).exec())
         .map((doc: EstadoUsuarioDoc) => {
            return this.mapToEstadoUsuario(doc)
            }
        )
    }

    async findEstadoById(estadoId: String): Promise<EstadoUsuario> {
        const model = await  EstadoUsuarioModel.findById(estadoId).exec()
        if (!model) throw new ModelNotFoundException()
        return this.mapToEstadoUsuario(model)
    }


/**
 *  Esto nos permite hacer un patrón Singleton en JavaScript. Esto quiere decir que en cada Servicio, en vez 
 *  de crear una instancia nueva de UsersDao por cada request del usuario , vamos a reutilizar esta instancia "instance"
 *  ya creada.
 */


    async getUserByDateRange(fechaInicial: Date, fechaHasta: Date): Promise<Array<User>>{
        const fechaI = new Date(fechaInicial)
        const fechaF = new Date(fechaHasta) 
        return (await UserModel.find({
            createdAt:{
                $gte: fechaInicial,
                $lte: fechaHasta
            }
        }).exec())
        .map((doc: UserDoc) => {
            return this.mapToUser(doc)
            }
        )
    }
}
 

//
//
// Estado Usuario
//
//


export const instance = new UsersDao()


