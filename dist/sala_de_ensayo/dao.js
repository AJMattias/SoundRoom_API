"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instance = exports.SalaDeEnsayoDao = void 0;
const exception_1 = require("../common/exception/exception");
const model_1 = require("./model");
const string_utils_1 = require("../common/utils/string_utils");
const mongoose_1 = require("mongoose");
const object_utils_1 = require("../common/utils/object-utils");
var mongoose = require('mongoose');
class SalaDeEnsayoDao {
    async getAll() {
        return (await model_1.SalaDeEnsayoModel.find({ enabled: 'habilitado' }).exec())
            .map((doc) => {
            return this.mapToSalaDeEnsayo(doc);
        });
    }
    // busca las salas de ensayo mas recientes, 5 salas
    async getPopulars() {
        return (await model_1.SalaDeEnsayoModel.find()
            .sort({ createdAt: -1 }) // Ordena por createdAt en orden descendente (los más recientes primero)
            .limit(5) // Limita los resultados a 5 documentos
            .populate("idOwner")
            .exec())
            .map((doc) => {
            return this.mapToSalaDeEnsayo(doc);
        });
    }
    //TODO get populars by ranking
    async findById(salaEnsayoId) {
        const model = await model_1.SalaDeEnsayoModel.findById(salaEnsayoId)
            .populate("imagenes").populate("idOwner").exec();
        if (!model)
            throw new exception_1.ModelNotFoundException();
        console.log('dao get sala: ', model);
        return this.mapToSalaDeEnsayo(model);
    }
    async findById2(salaEnsayoId) {
        console.log('findById2');
        if (!mongoose.Types.ObjectId.isValid(salaEnsayoId)) {
            throw new Error('ID de documento no válido');
        }
        const model = await model_1.SalaDeEnsayoModel.findOne({ _id: salaEnsayoId
            //, enabled: 'habilitado'
        })
            .populate("idOwner").populate("imagenes").populate({
            path: 'opiniones',
            populate: {
                path: 'idUser',
                select: '_id name lastName imageId' // Selecciona solo los campos '_id 'name' y 'imageId' del usuario
            }
        })
            .exec();
        if (!model)
            throw new exception_1.ModelNotFoundException();
        console.log('dao get sala id: ', salaEnsayoId);
        return this.mapToSalaDeEnsayo(model);
    }
    /*<<
    async findByName(query: string): Promise<Array<SalaDeEnsayo>> {
        const models = await SalaDeEnsayoModel.find({$text : { $search : query }}).exec()
        return models.map((model:SalaDeEnsayoDoc) => this.mapToSalaDeEnsayo(model))
    }
    */
    async findByName(query) {
        return (await model_1.SalaDeEnsayoModel.find({ nameSalaEnsayo: { $regex: query, $options: 'i' }, enabled: 'habilitado' }).populate("idOwner").exec())
            // return(await SalaDeEnsayoModel.find({$text : { $search : query }}, {enabled: true}).exec())
            .map((doc) => {
            return this.mapToSalaDeEnsayo(doc);
        });
    }
    async getSearch(sala) {
        return (await model_1.SalaDeEnsayoModel.find({
            idType: mongoose.Types.ObjectId(sala.idType),
            //idLocality: mongoose.Types.ObjectId(sala.idLocality)
        }, { enabled: 'habilitado' }).exec())
            .map((doc) => {
            return this.mapToSalaDeEnsayo(doc);
        });
    }
    async getByOwner(idOwner) {
        const sala = await model_1.SalaDeEnsayoModel.find({ idOwner: mongoose.Types.ObjectId(idOwner) })
            .populate("imagenes")
            .populate({
            path: "opiniones",
            populate: {
                path: "idUser",
                model: "User" // Asegúrate de que este es el nombre de tu modelo de usuario
            }
        }).exec();
        console.log('salas dao by owner: ', sala);
        return (sala.map((doc) => {
            return this.mapToSalaDeEnsayoImagen(doc);
        }));
    }
    async getByOwnerPaginated(idOwner, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [salas, total] = await Promise.all([
            model_1.SalaDeEnsayoModel.find({ idOwner: new mongoose.Types.ObjectId(idOwner) })
                .populate("imagenes")
                .populate({
                path: "opiniones",
                populate: { path: "idUser", model: "User" }
            })
                .skip(skip)
                .limit(limit)
                .exec(),
            model_1.SalaDeEnsayoModel.countDocuments({ idOwner: new mongoose.Types.ObjectId(idOwner) })
        ]);
        return {
            data: salas.map((doc) => this.mapToSalaDeEnsayo(doc)),
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }
    async store(salaDeEnsayo) {
        const enabledHistoryEntry = {
            status: "habilitado",
            dateFrom: new Date(),
            dateTo: null,
        };
        console.log("dao idImagen: ", salaDeEnsayo.imagenes);
        console.log("dao sde e imagen ", salaDeEnsayo);
        const imagenIds = salaDeEnsayo.imagenes.map(img => img.id);
        const SalaDeEnsayoDoc = await model_1.SalaDeEnsayoModel.create({
            nameSalaEnsayo: salaDeEnsayo.nameSalaEnsayo,
            calleDireccion: salaDeEnsayo.calleDireccion,
            //numeroDireccion: salaDeEnsayo.numeroDireccion,
            // idLocality: salaDeEnsayo.idLocality,
            idType: salaDeEnsayo.idType,
            precioHora: salaDeEnsayo.precioHora,
            idOwner: salaDeEnsayo.idOwner,
            duracionTurno: salaDeEnsayo.duracionTurno,
            descripcion: salaDeEnsayo.descripcion,
            createdAt: new Date(),
            enabled: salaDeEnsayo.enabled,
            comodidades: salaDeEnsayo.comodidades,
            enabledHistory: [enabledHistoryEntry],
            imagenes: imagenIds,
            horarios: salaDeEnsayo.horarios
        });
        return this.mapToSalaDeEnsayo(SalaDeEnsayoDoc);
    }
    // no actualiza atributos booleanos
    // async updateSala(salaEnsayoId: string, sala: CreateSalaDeEnsayoDto2): Promise<SalaDeEnsayo>{
    //     console.log('dao update sala: ', sala)
    //     const updated = await SalaDeEnsayoModel.findByIdAndUpdate(salaEnsayoId,{
    //         $set: {
    //             enabled: sala.enabled,
    //             nameSalaEnsayo : sala.nameSalaEnsayo,
    //             calleDireccion: sala.calleDireccion,
    //             numeroDireccion: sala.numeroDireccion,
    //             precioHora: sala.precioHora,
    //             createdAt: sala.createdAt,
    //             comodidades: sala.comodidades    
    //         }    
    //     }, { new: true }).exec()
    //     if(!updated){
    //         throw new ModelNotFoundException() 
    //     }
    //     return this.mapToSalaDeEnsayo(updated)
    // }
    async updateSala(salaEnsayoId, sala) {
        console.log('dao update sala id y sala: ', salaEnsayoId, sala);
        const { imagenes, ...updatePayload } = sala;
        // ➡️ Crea un objeto genérico a partir del DTO para que coincida con el tipo esperado
        const genericObject = { ...updatePayload };
        const updatePayloadF = (0, object_utils_1.filterUndefined)(genericObject);
        // ... tu lógica de actualización sigue aquí
        const updated = await model_1.SalaDeEnsayoModel.findByIdAndUpdate(salaEnsayoId, updatePayloadF, { new: true }).exec();
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToSalaDeEnsayo(updated);
    }
    async disableSala(salaEnsayoId, sala) {
        console.log('dao disable sala');
        const updated = await model_1.SalaDeEnsayoModel.findByIdAndUpdate(salaEnsayoId, {
            enabled: "deshabilitado",
            nameSalaEnsayo: sala.nameSalaEnsayo,
            calleDireccion: sala.calleDireccion,
            numeroDireccion: sala.numeroDireccion,
            precioHora: sala.precioHora,
            createdAt: sala.createdAt,
            comodidades: sala.comodidades,
            descripcion: sala.descripcion,
            $push: { enabledHistory: { status: 'deshabilitado', dateFrom: new Date() } },
        }, { new: true });
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToSalaDeEnsayo(updated);
    }
    async enableSala(salaEnsayoId, sala) {
        console.log('dao enable sala');
        const updated = await model_1.SalaDeEnsayoModel.findByIdAndUpdate(salaEnsayoId, {
            enabled: "habilitado",
            nameSalaEnsayo: sala.nameSalaEnsayo,
            calleDireccion: sala.calleDireccion,
            numeroDireccion: sala.numeroDireccion,
            precioHora: sala.precioHora,
            createdAt: sala.createdAt,
            comodidades: sala.comodidades,
            descripcion: sala.descripcion,
            $push: { enabledHistory: { status: 'habilitado', dateFrom: new Date() } },
        }, { new: true });
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToSalaDeEnsayo(updated);
    }
    async stopEnabledSala(salaId) {
        console.log('dao stop enable sala');
        const updated = await model_1.SalaDeEnsayoModel.findOneAndUpdate({ _id: salaId, "enabledHistory.dateTo": null }, { $set: { "enabledHistory.$.dateTo": new Date() } });
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToSalaDeEnsayo(updated);
    }
    async updateSalaOpinion(salaEnsayoId, sala, idOpinion) {
        const updated = await model_1.SalaDeEnsayoModel.findByIdAndUpdate(salaEnsayoId, {
            nameSalaEnsayo: sala.nameSalaEnsayo,
            calleDireccion: sala.calleDireccion,
            numeroDireccion: sala.numeroDireccion,
            precioHora: sala.precioHora,
            $push: { opiniones: idOpinion }
        }).exec();
        console.log('dao, sala actualizada: ', updated);
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToSalaDeEnsayo(updated);
    }
    async deleteSala(salaEnsayoId, sala) {
        const updated = await model_1.SalaDeEnsayoModel.findByIdAndUpdate(salaEnsayoId, {
            nameSalaEnsayo: sala.nameSalaEnsayo,
            calleDireccion: sala.calleDireccion,
            precioHora: sala.precioHora,
            numeroDireccion: sala.numeroDireccion,
            idOwner: sala.idOwner ? string_utils_1.StringUtils.toObjectId(sala.idOwner) : undefined,
            idType: sala.idType ? string_utils_1.StringUtils.toObjectId(sala.idType) : undefined,
            duracionTurno: sala.duracionTurno,
            deletedAt: sala.deletedAt,
            comodidades: sala.comodidades,
            enabled: 'deshabilitado',
        }).exec();
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToSalaDeEnsayo(updated);
    }
    //Funciona delete con{_id: id}
    async borrarSala(salaEnsayoId) {
        const query = { id: new mongoose_1.Types.ObjectId(salaEnsayoId) };
        //const query = { id: StringUtils.toObjectId(salaEnsayoId) };
        const result = await model_1.SalaDeEnsayoModel.deleteOne({ _id: salaEnsayoId });
        if (result.deletedCount === 0) {
            throw new exception_1.ModelNotFoundException();
            console.log();
        }
        else {
            console.log('Documento eliminado exitosamente');
            return true;
        }
    }
    //actualizar nuevas imagenes de sala de ensayo
    async updateSalaImages(salaEnsayoId, imagesToUpdate) {
        // Validamos que el array de imágenes no sea nulo ni indefinido
        if (!imagesToUpdate || !imagesToUpdate.images) {
            throw new Error('El objeto de imágenes no puede ser nulo.');
        }
        // Validamos que el array de imágenes no sea nulo ni indefinido
        if (!imagesToUpdate || !imagesToUpdate.images || imagesToUpdate.images.length === 0) {
            throw new Error('El objeto de imágenes no puede ser nulo o vacío.');
        }
        // Convertir los IDs de las imágenes a ObjectIds de Mongoose
        const newImageObjectIds = imagesToUpdate.images.map(id => new mongoose_1.Types.ObjectId(id));
        const updated = await model_1.SalaDeEnsayoModel.findByIdAndUpdate(salaEnsayoId, {
            // Usa $push con $each para agregar múltiples elementos al array 'imagenes'
            $push: { imagenes: { $each: newImageObjectIds } }
        }, {
            new: true, // Devuelve el documento actualizado
        }).exec();
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToSalaDeEnsayo(updated);
    }
    mapToSalaDeEnsayoImagen(document) {
        const imagenesFormatoCorrectoParaInterfaz = document.imagenes.map(id => ({ type: id.toString() }));
        return {
            id: document._id,
            nameSalaEnsayo: document.nameSalaEnsayo,
            calleDireccion: document.calleDireccion,
            precioHora: document.precioHora,
            numeroDireccion: document.numeroDireccion,
            imagenes: document.imagenes,
            idOwner: document.idOwner,
            duracionTurno: document.duracionTurno,
            createdAt: document.createdAt,
            idLocality: document.idLocality,
            idType: document.idType,
            deletedAt: document.deletedAt,
            enabled: document.enabled,
            descripcion: document.descripcion,
            comodidades: document.comodidades,
            opiniones: document.opiniones,
            enabledHistory: document.enabledHistory,
            horarios: document.horarios
        };
    }
    mapToSalaDeEnsayo(document) {
        return {
            id: document._id,
            nameSalaEnsayo: document.nameSalaEnsayo,
            calleDireccion: document.calleDireccion,
            precioHora: document.precioHora,
            numeroDireccion: document.numeroDireccion,
            imagenes: document.imagenes,
            idOwner: document.idOwner,
            duracionTurno: document.duracionTurno,
            createdAt: document.createdAt,
            idLocality: document.idLocality,
            idType: document.idType,
            deletedAt: document.deletedAt,
            enabled: document.enabled,
            descripcion: document.descripcion,
            comodidades: document.comodidades,
            opiniones: document.opiniones,
            enabledHistory: document.enabledHistory,
            horarios: document.horarios
        };
    }
    // Document opinion de sala de ensayo
    async getAllOpiniones() {
        return (await model_1.OpinionModel.find().exec())
            .map((doc) => {
            return this.mapToOpinion(doc);
        });
    }
    async createOpinion(opinion) {
        const opinionDoc = await model_1.OpinionModel.create({
            descripcion: opinion.descripcion,
            idUser: opinion.idUser,
            estrellas: opinion.estrellas,
            idRoom: opinion.idRoom,
            idArtist: opinion.idArtist,
        });
        return this.mapToOpinion(opinionDoc);
    }
    async createOpinionArtist(opinion) {
        const opinionDoc = await model_1.OpinionModel.create({
            descripcion: opinion.descripcion,
            idUser: opinion.idUser,
            estrellas: opinion.estrellas,
            idArtist: opinion.idArtist,
        });
        return this.mapToOpinion(opinionDoc);
    }
    async updateOpinion(opinion) {
        const opinionUpdatedDoc = await model_1.OpinionModel.findByIdAndUpdate(opinion.id, {
            descripcion: opinion.descripcion,
            idUser: opinion.idUser,
            estrellas: opinion.estrellas
        }).exec();
        if (!opinionUpdatedDoc) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToOpinion(opinionUpdatedDoc);
    }
    async getOpinionByUserAndRoom(idUser, idRoom) {
        const idroom = mongoose.Types.ObjectId(idRoom);
        const iduser = mongoose.Types.ObjectId(idUser);
        const opinionDoc = await model_1.OpinionModel.findOne({ idUser: iduser, idRoom: idroom }).exec();
        console.log('dao getted opinion to room: ', opinionDoc);
        if (!opinionDoc)
            throw new exception_1.ModelNotFoundException();
        return this.mapToOpinion(opinionDoc);
    }
    async getOpinionByUserAndArtist(idUser, idArtist) {
        const idartista = mongoose.Types.ObjectId(idArtist);
        const iduser = mongoose.Types.ObjectId(idUser);
        const opinionDoc = await model_1.OpinionModel.findOne({ idUser: iduser, idArtist: idartista }).exec();
        console.log('dao getted opinion to room: ', opinionDoc);
        if (!opinionDoc)
            throw new exception_1.ModelNotFoundException();
        return this.mapToOpinion(opinionDoc);
    }
    async getOpinionById(opinionId) {
        const model = await model_1.OpinionModel.findById(opinionId).exec();
        if (!model)
            throw new exception_1.ModelNotFoundException();
        return this.mapToOpinion(model);
    }
    //get opiniones hechas a un artista
    // bug: mongoose: To create a new ObjectId please try `Mongoose.Types.ObjectId` ->
    // instead of using `Mongoose.Schema.ObjectId`
    async getOpinionToArtist(artistId) {
        const idArtist = mongoose.Types.ObjectId(artistId);
        return (await model_1.OpinionModel.find({ idArtist: idArtist }).populate("idUser").exec())
            .map((doc) => {
            return this.mapToOpinion(doc);
        });
    }
    async getOpinionByRoom(idRoom) {
        const idroom = mongoose.Types.ObjectId(idRoom);
        const opinionDoc = await model_1.OpinionModel.find({ idRoom: idroom }).exec();
        console.log('dao getted opinion to room: ', opinionDoc);
        if (!opinionDoc)
            throw new exception_1.ModelNotFoundException();
        const opinionDto = opinionDoc.map((doc) => {
            return this.mapToOpinion(doc);
        });
        return opinionDto;
    }
    //TODO hacer delete de opinion y getters quizas
    mapToOpinion(document) {
        return {
            id: document._id,
            descripcion: document.descripcion,
            estrellas: document.estrellas,
            idUser: document.idUser,
            idRoom: document.idRoom,
            idArtist: document.idArtist
        };
    }
}
exports.SalaDeEnsayoDao = SalaDeEnsayoDao;
exports.instance = new SalaDeEnsayoDao();
