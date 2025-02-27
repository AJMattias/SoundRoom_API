import { ModelNotFoundException } from "../common/exception/exception";
import { CreateOpinionArtistDto, CreateOpinionDto, CreateSalaDeEnsayoDto, CreateSalaDeEnsayoDto2, CreateSalaDeEnsayoDtoOpinion, CreateSearchSdEDto, OpinionDto, SalaDeEnsayoDto} from "./dto";
import { Opinion, OpinionDoc, OpinionModel, SalaDeEnsayo, SalaDeEnsayoDoc, SalaDeEnsayoModel } from "./model";
import {StringUtils} from "../common/utils/string_utils";
import { Mongoose, ObjectId } from "mongoose"
import { Types } from 'mongoose';



var mongoose = require('mongoose');

export class SalaDeEnsayoDao{

async getAll():Promise<Array<SalaDeEnsayo>>{
    return(await SalaDeEnsayoModel.find({enabled:'habilitado'}).exec())
    .map((doc:SalaDeEnsayoDoc)=>{
        return this.mapToSalaDeEnsayo(doc)
    })
}

async getPopulars():Promise<Array<SalaDeEnsayo>>{
    return(await SalaDeEnsayoModel.find()
    .sort({ createdAt: -1 }) // Ordena por createdAt en orden descendente (los más recientes primero)
    .limit(5)                 // Limita los resultados a 5 documentos
    .populate("idOwner")                 
    .exec())
    .map((doc:SalaDeEnsayoDoc)=>{
        return this.mapToSalaDeEnsayo(doc)
    })
}

async findById(salaEnsayoId: string): Promise<SalaDeEnsayo>{
    const model = await SalaDeEnsayoModel.findById(salaEnsayoId)
    .populate("idImagen").populate("idOwner").exec()
    if(!model) throw new ModelNotFoundException()
    console.log('dao get asala: ', model)
    return this.mapToSalaDeEnsayo(model)
}

async findById2(salaEnsayoId: string): Promise<SalaDeEnsayo>{
    console.log('findById2')
    if (!mongoose.Types.ObjectId.isValid(salaEnsayoId)) {
        throw new Error('ID de documento no válido');
    }
    const model = await SalaDeEnsayoModel.findOne({_id: salaEnsayoId 
        //, enabled: 'habilitado'
    })
    .populate("idOwner")
    .exec()
    if(!model) throw new ModelNotFoundException()
    console.log('dao get asala: ', model)
    return this.mapToSalaDeEnsayo(model)
}

/*<<
async findByName(query: string): Promise<Array<SalaDeEnsayo>> {
    const models = await SalaDeEnsayoModel.find({$text : { $search : query }}).exec()
    return models.map((model:SalaDeEnsayoDoc) => this.mapToSalaDeEnsayo(model))
}
*/

async findByName(query: string): Promise<Array<SalaDeEnsayo>> {
    return(await SalaDeEnsayoModel.find({nameSalaEnsayo: { $regex: query, $options: 'i' } , enabled: 'habilitado'}).populate("idOwner").exec())
    // return(await SalaDeEnsayoModel.find({$text : { $search : query }}, {enabled: true}).exec())
    .map((doc:SalaDeEnsayoDoc)=>{
        return this.mapToSalaDeEnsayo(doc)
    })
}

async getSearch(sala: CreateSearchSdEDto):Promise<Array<SalaDeEnsayo>>{
    return(await SalaDeEnsayoModel.find({
        idType: mongoose.Types.ObjectId(sala.idType), 
        //idLocality: mongoose.Types.ObjectId(sala.idLocality)
    }, {enabled: 'habilitado'}).exec())
    .map((doc:SalaDeEnsayoDoc)=>{
        return this.mapToSalaDeEnsayo(doc)
    })
}


async getByOwner(idOwner: string):Promise<Array<SalaDeEnsayo>>{
    return(await SalaDeEnsayoModel.find({
        idOwner: mongoose.Types.ObjectId(idOwner), 
        //enabled: true
    }).exec())
    .map((doc:SalaDeEnsayoDoc)=>{
        return this.mapToSalaDeEnsayo(doc)
    })
}

async store(salaDeEnsayo: CreateSalaDeEnsayoDto): Promise<SalaDeEnsayo>{
    const enabledHistoryEntry = {
        status: "habilitado",
        dateFrom: new Date(),
        dateTo: null,
    };
    console.log("dao idImagen: ", salaDeEnsayo.idImagen)
    console.log("dao sde e imagen ", salaDeEnsayo)
    const idImagen = salaDeEnsayo.idImagen as string
    const SalaDeEnsayoDoc = await SalaDeEnsayoModel.create({
        nameSalaEnsayo: salaDeEnsayo.nameSalaEnsayo,
        calleDireccion: salaDeEnsayo.calleDireccion, 
        //numeroDireccion: salaDeEnsayo.numeroDireccion,
        // idLocality: salaDeEnsayo.idLocality,
        idImagen: idImagen,
        idType: salaDeEnsayo.idType, 
        precioHora: salaDeEnsayo.precioHora, 
        idOwner: salaDeEnsayo.idOwner,
        duracionTurno: salaDeEnsayo.duracionTurno,
        descripcion: salaDeEnsayo.descripcion,
        createdAt: new Date(),
        enabled: salaDeEnsayo.enabled,
        comodidades:salaDeEnsayo.comodidades,
        enabledHistory: [enabledHistoryEntry],
    }); 
     return this.mapToSalaDeEnsayo(SalaDeEnsayoDoc)

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


async updateSala(salaEnsayoId: string, sala: CreateSalaDeEnsayoDto2): Promise<SalaDeEnsayo>{
    console.log('dao update sala: ', sala)
    // const updated = await SalaDeEnsayoModel.findOneAndUpdate(
    //     { _id: salaEnsayoId },
    //     {
    //         $set: {
    //             enabled: sala.enabled,
    //             nameSalaEnsayo: sala.nameSalaEnsayo,
    //             calleDireccion: sala.calleDireccion,
    //             numeroDireccion: sala.numeroDireccion,
    //             precioHora: sala.precioHora,
    //             createdAt: sala.createdAt,
    //             comodidades: sala.comodidades,
    //             descripcion:sala.descripcion,
    //             enabledHistory: sala.enabledHistory,
    //         }
    //     },
    //     { new: true, runValidators: true }
    // ).exec();
    const updated = await SalaDeEnsayoModel.findByIdAndUpdate(salaEnsayoId,
        {
            enabled: sala.enabled,
            nameSalaEnsayo: sala.nameSalaEnsayo,
            calleDireccion: sala.calleDireccion,
            numeroDireccion: sala.numeroDireccion,
            precioHora: sala.precioHora,
            createdAt: sala.createdAt,
            comodidades: sala.comodidades,
            descripcion:sala.descripcion,
            $push: { enabledHistory: { status: sala.enabled, dateFrom: new Date() } },
        },
        { new: true
            //, runValidators: true 
            }
    ).exec();
    if(!updated){
        throw new ModelNotFoundException() 
    }
    return this.mapToSalaDeEnsayo(updated)
}

async disableSala(salaEnsayoId: string, sala: CreateSalaDeEnsayoDto2):Promise<SalaDeEnsayo>{
    console.log('dao disable sala')
    const updated = await SalaDeEnsayoModel.findByIdAndUpdate(salaEnsayoId, {
                enabled: "deshabilitado",
                nameSalaEnsayo: sala.nameSalaEnsayo,
                calleDireccion: sala.calleDireccion,
                numeroDireccion: sala.numeroDireccion,
                precioHora: sala.precioHora,
                createdAt: sala.createdAt,
                comodidades: sala.comodidades,
                descripcion:sala.descripcion,
                $push: { enabledHistory: { status: 'deshabilitado', dateFrom: new Date() } },
    },{new: true})
    if (!updated) {
        throw new ModelNotFoundException()
    }
    return this.mapToSalaDeEnsayo(updated)
}

async enableSala(salaEnsayoId: string, sala: CreateSalaDeEnsayoDto2):Promise<SalaDeEnsayo>{
    console.log('dao enable sala')
    const updated = await SalaDeEnsayoModel.findByIdAndUpdate(salaEnsayoId, {
                enabled: "habilitado",
                nameSalaEnsayo: sala.nameSalaEnsayo,
                calleDireccion: sala.calleDireccion,
                numeroDireccion: sala.numeroDireccion,
                precioHora: sala.precioHora,
                createdAt: sala.createdAt,
                comodidades: sala.comodidades,
                descripcion:sala.descripcion,
                $push: { enabledHistory: { status: 'habilitado', dateFrom: new Date() } },
    },{new: true})
    if (!updated) {
        throw new ModelNotFoundException()
    }
    return this.mapToSalaDeEnsayo(updated)
}

async stopEnabledSala(salaId: string): Promise<SalaDeEnsayo>{
    console.log('dao stop enable sala')
    const updated = await SalaDeEnsayoModel.findOneAndUpdate(
        { _id: salaId, "enabledHistory.dateTo": null },
        { $set: { "enabledHistory.$.dateTo": new Date() } }
    );
     
     if (!updated) {
         throw new ModelNotFoundException()
     }
     return this.mapToSalaDeEnsayo(updated)
}



async updateSalaOpinion(salaEnsayoId: string, sala: CreateSalaDeEnsayoDtoOpinion, idOpinion: string): Promise<SalaDeEnsayo>{
    const updated = await SalaDeEnsayoModel.findByIdAndUpdate(salaEnsayoId,{
        nameSalaEnsayo : sala.nameSalaEnsayo,
        calleDireccion: sala.calleDireccion,
        numeroDireccion: sala.numeroDireccion,
        precioHora: sala.precioHora, 
        $push: {opiniones: idOpinion}
    }).exec()
    console.log('dao, sala actualizada: ', updated)
    if(!updated){
        throw new ModelNotFoundException() 
    }
    return this.mapToSalaDeEnsayo(updated)
}

async deleteSala(salaEnsayoId: string, sala: CreateSalaDeEnsayoDto2): Promise<SalaDeEnsayo>{
    const updated = await SalaDeEnsayoModel.findByIdAndUpdate(salaEnsayoId,{
        nameSalaEnsayo : sala.nameSalaEnsayo,
        calleDireccion: sala.calleDireccion,
        precioHora: sala.precioHora, 
        numeroDireccion: sala.numeroDireccion,
        idOwner: sala.idOwner? StringUtils.toObjectId(sala.idOwner) : undefined, 
        idType: sala.idType? StringUtils.toObjectId(sala.idType) : undefined, 
        duracionTurno: sala.duracionTurno,
        deletedAt: sala.deletedAt,
        comodidades: sala.comodidades,
        enabled: 'deshabilitado',
    }).exec()
    if(!updated){
        throw new ModelNotFoundException()
    }
    return this.mapToSalaDeEnsayo(updated)
}

//Funciona delete con{_id: id}
async borrarSala(salaEnsayoId: string): Promise<Boolean>{
    const query = { id: new Types.ObjectId(salaEnsayoId) };
    //const query = { id: StringUtils.toObjectId(salaEnsayoId) };
    const result = await SalaDeEnsayoModel.deleteOne({_id: salaEnsayoId}) 
    if (result.deletedCount === 0) {
        throw new ModelNotFoundException();
        console.log()
    } else {
        console.log('Documento eliminado exitosamente');
        return true;
    }
}

mapToSalaDeEnsayo(document: SalaDeEnsayoDoc): SalaDeEnsayo {
    return{
        id: document._id as unknown as string,
        nameSalaEnsayo: document.nameSalaEnsayo,
        calleDireccion: document.calleDireccion,
        precioHora: document.precioHora, 
        numeroDireccion: document.numeroDireccion,
        idImagen:document.idImagen,
        idOwner: document.idOwner as unknown as string,
        duracionTurno: document.duracionTurno,
        createdAt: document.createdAt,
        idLocality: document.idLocality as unknown as string,
        idType: document.idType as unknown as string,
        deletedAt: document.deletedAt,
        enabled: document.enabled,
        descripcion: document.descripcion,
        comodidades:  document.comodidades,
        opiniones: document.opiniones,
        enabledHistory: document.enabledHistory

    }
} 

// Document opinion de sala de ensayo

async getAllOpiniones(): Promise<Array<Opinion>> {
    return (await OpinionModel.find().exec())
    .map((doc: OpinionDoc)=>{
        return this.mapToOpinion(doc)
    })
}

async createOpinion(opinion: CreateOpinionDto): Promise<Opinion>{
    const opinionDoc = await OpinionModel.create({
        descripcion: opinion.descripcion,
        idUser: opinion.idUser,
        estrellas: opinion.estrellas,
        idRoom: opinion.idRoom,
        idArtist: opinion.idArtist,
    })
    return this.mapToOpinion(opinionDoc)
}

async createOpinionArtist(opinion: CreateOpinionArtistDto): Promise<Opinion>{
    const opinionDoc = await OpinionModel.create({
        descripcion: opinion.descripcion,
        idUser: opinion.idUser,
        estrellas: opinion.estrellas,
        idArtist: opinion.idArtist,
    })
    return this.mapToOpinion(opinionDoc)
}

async updateOpinion(opinion: OpinionDto): Promise<Opinion>{
    const opinionUpdatedDoc = await OpinionModel.findByIdAndUpdate(opinion.id, {
        descripcion: opinion.descripcion,
        idUser: opinion.idUser,
        estrellas: opinion.estrellas
    }).exec()
    if(!opinionUpdatedDoc){
        throw new ModelNotFoundException() 
    }
    return this.mapToOpinion(opinionUpdatedDoc)
}

async getOpinionByUserAndRoom(idUser: string, idRoom: string): Promise<Opinion>{
    const idroom = mongoose.Types.ObjectId(idRoom);
    const iduser = mongoose.Types.ObjectId(idUser);

    const opinionDoc = await OpinionModel.findOne({ idUser: iduser, idRoom: idroom }).exec()
    console.log('dao getted opinion to room: ', opinionDoc)
    if(!opinionDoc) throw new ModelNotFoundException()
    return this.mapToOpinion(opinionDoc)

}

async getOpinionByUserAndArtist(idUser: string, idArtist: string): Promise<Opinion>{
    const idartista = mongoose.Types.ObjectId(idArtist);
    const iduser = mongoose.Types.ObjectId(idUser);

    const opinionDoc = await OpinionModel.findOne({ idUser: iduser, idArtist: idartista }).exec()
    console.log('dao getted opinion to room: ', opinionDoc)
    if(!opinionDoc) throw new ModelNotFoundException()
    return this.mapToOpinion(opinionDoc)

}

async getOpinionById( opinionId: string): Promise<Opinion>{
    const model = await OpinionModel.findById(opinionId).exec()
    if (!model) throw new ModelNotFoundException()
    return this.mapToOpinion(model)
}

//get opiniones hechas a un artista
// bug: mongoose: To create a new ObjectId please try `Mongoose.Types.ObjectId` ->
// instead of using `Mongoose.Schema.ObjectId`
async getOpinionToArtist( artistId: string): Promise<Array<Opinion>>{
    const idArtist = mongoose.Types.ObjectId(artistId);
    return (await OpinionModel.find({idArtist: idArtist}).populate("idUser").exec())
    .map((doc: OpinionDoc)=>{
        return this.mapToOpinion(doc)
    })
}



//TODO hacer delete de opinion y getters quizas


mapToOpinion(document: OpinionDoc): Opinion{
    return {
        id:  document._id as unknown as string,
        descripcion: document.descripcion,
        estrellas: document.estrellas,
        idUser:  document.idUser as unknown as string,
        idRoom: document.idRoom as unknown as string,
        idArtist: document.idArtist as unknown as string
    }
}

}

export const instance = new SalaDeEnsayoDao()