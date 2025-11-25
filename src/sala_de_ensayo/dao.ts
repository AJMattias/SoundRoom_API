import { ModelNotFoundException } from "../common/exception/exception";
import { CreateOpinionArtistDto, CreateOpinionDto, CreateSalaDeEnsayoDto, CreateSalaDeEnsayoDto2, CreateSalaDeEnsayoDtoOpinion, CreateSearchSdEDto, OpinionDto, SalaDeEnsayoDto, UpdateSalaDeEnsayoDto2} from "./dto";
import { Opinion, OpinionDoc, OpinionModel, SalaDeEnsayo, SalaDeEnsayoDoc, SalaDeEnsayoModel } from "./model";
import {StringUtils} from "../common/utils/string_utils";
import { Mongoose, ObjectId } from "mongoose"
import { Types } from 'mongoose';
import { ImagenDoc, ImagenModel } from "../imagen/model";
import { ImagenDto } from "../imagen/dto";
import { UpdateImageDto } from "../sala_de_ensayo/dto";
import { filterUndefined } from "../common/utils/object-utils";



var mongoose = require('mongoose');

export interface PaginatedResponseDto<T> {
    page: number;
    limit: number;
    total: number;
    data: T[]; // T será SalaDeEnsayoDto
}

type DaoPaginationResult = { 
    data: Array<SalaDeEnsayo>; // Entidades de dominio sin mapear a DTO
    total: number;
};

export class SalaDeEnsayoDao{

async getAll():Promise<Array<SalaDeEnsayo>>{
    return(await SalaDeEnsayoModel.find({enabled:'habilitado'}).exec())
    .map((doc:SalaDeEnsayoDoc)=>{
        return this.mapToSalaDeEnsayo(doc)
    })
}

// busca las salas de ensayo mas recientes, 5 salas
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
//TODO get populars by ranking

async findById(salaEnsayoId: string): Promise<SalaDeEnsayo>{
    const model = await SalaDeEnsayoModel.findById(salaEnsayoId)
    .populate("imagenes").populate("idOwner").exec()
    if(!model) throw new ModelNotFoundException()
    return this.mapToSalaDeEnsayo(model)
}


async findById2(salaEnsayoId: string): Promise<SalaDeEnsayo> {
    
    if (!mongoose.Types.ObjectId.isValid(salaEnsayoId)) {
        throw new Error('ID de documento no válido');
    }

    const model = await SalaDeEnsayoModel.findOne(
        { 
        _id: salaEnsayoId,
        enabled:"habilitado"
        })
        .populate("idOwner")
        .populate({
            path: 'imagenes',
            select: 'url titulo descripcion'
        })
        .populate({
            path: 'opiniones',
            populate: {
                path: 'idUser',
                select: '_id name lastName imageId'
            }
        })
        .exec();
    
    if (!model) throw new ModelNotFoundException();

    const result = this.mapToSalaDeEnsayo(model);
    return result;
}

async findByName(query: string): Promise<Array<SalaDeEnsayo>> {
    const docs = await SalaDeEnsayoModel.find(
        {
            nameSalaEnsayo: { $regex: query, $options: 'i' } , 
            enabled: 'habilitado'})
            .populate("idOwner")
            .lean()
            .exec()
    // return(await SalaDeEnsayoModel.find({$text : { $search : query }}, {enabled: true}).exec())
    return docs.map((doc: any) => {
        return this.mapToSalaDeEnsayo(doc as any)
    })
}

async findByNameAndPaginate(
    query: string,
    page: number,
    limit: number
): Promise<DaoPaginationResult> {
    
    // 1. Calcular el desplazamiento (offset)
    const skip = (page - 1) * limit;

    // 2. Definir la query de filtro (la usamos para el conteo y la búsqueda)
    const filterQuery = {
        nameSalaEnsayo: { $regex: query, $options: 'i' }, 
        enabled: 'habilitado'
    };
    
    // 3. Obtener el total de documentos que coinciden (SIN PAGINAR)
    const total = await SalaDeEnsayoModel.countDocuments(filterQuery);
    
    // 4. Obtener los documentos paginados
    const docs = await SalaDeEnsayoModel.find(filterQuery)
        .populate("idOwner")
        .populate({
            path: 'imagenes',
            select: 'url titulo',
            model: 'Imagen'
        })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

    // 5. Mapear los documentos de Mongoose a tu entidad de dominio (SalaDeEnsayo)
    const data = docs.map((doc: any) => {
        // Usamos la función base para mapear UNA Sala
        return this.mapToSalaDeEnsayo(doc as any);
    });
    // 6. Devolver el objeto con los datos y el total
    return { data, total };
}

async getSearch(sala: CreateSearchSdEDto):Promise<Array<SalaDeEnsayo>>{
    return(await SalaDeEnsayoModel.find({
        idType: mongoose.Types.ObjectId(sala.idType), 
        //idLocality: mongoose.Types.ObjectId(sala.idLocality)
      }, {enabled: 'habilitado'} as any).exec())
    .map((doc:SalaDeEnsayoDoc)=>{
        return this.mapToSalaDeEnsayo(doc)
    })
}


async getByOwner(idOwner: string):Promise<Array<SalaDeEnsayo>>{  
    const sala = await SalaDeEnsayoModel.find({idOwner: new mongoose.Types.ObjectId(idOwner)})
        .populate("imagenes")
        .populate({
            path: "opiniones",
            populate: {
                path: "idUser",
                model: "User" // Asegúrate de que este es el nombre de tu modelo de usuario
            }
        }).exec()
    return(sala.map((doc:SalaDeEnsayoDoc)=>{
        return this.mapToSalaDeEnsayoImagen(doc)
    }))
}

async getByOwnerPaginated(
  idOwner: string, 
  page: number = 1, 
  limit: number = 10
): Promise<{ data: SalaDeEnsayo[]; total: number; page: number; totalPages: number }> {

  const skip = (page - 1) * limit;

  const [salas, total] = await Promise.all([
    SalaDeEnsayoModel.find({ idOwner: new mongoose.Types.ObjectId(idOwner) })
      .populate("imagenes")
      .populate({
        path: "opiniones",
        populate: { path: "idUser", model: "User" }
      })
      .skip(skip)
      .limit(limit)
      .exec(),
    SalaDeEnsayoModel.countDocuments({ idOwner: new mongoose.Types.ObjectId(idOwner) })
  ]);

  return {
    data: salas.map((doc: SalaDeEnsayoDoc) => this.mapToSalaDeEnsayo(doc)),
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

async store(salaDeEnsayo: CreateSalaDeEnsayoDto): Promise<SalaDeEnsayo>{
    const enabledHistoryEntry = {
        status: "habilitado",
        dateFrom: new Date(),
        dateTo: null,
    };
    console.log("dao idImagen: ", salaDeEnsayo.imagenes)
    console.log("dao sde e imagen ", salaDeEnsayo)

    const imagenIds = salaDeEnsayo.imagenes.map(img => img.id);

    const SalaDeEnsayoDoc = await SalaDeEnsayoModel.create({
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
        comodidades:salaDeEnsayo.comodidades,
        enabledHistory: [enabledHistoryEntry],
        imagenes: imagenIds,
        horarios: salaDeEnsayo.horarios
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


async updateSala(salaEnsayoId: string, sala: UpdateSalaDeEnsayoDto2): Promise<SalaDeEnsayo>{
    console.log('dao update sala id y sala: ', salaEnsayoId, sala)
    const { imagenes, ...updatePayload } = sala;
    // ➡️ Crea un objeto genérico a partir del DTO para que coincida con el tipo esperado
    const genericObject: Record<string, unknown> = { ...updatePayload };

    const updatePayloadF = filterUndefined(genericObject);
    
    // ... tu lógica de actualización sigue aquí
    const updated = await SalaDeEnsayoModel.findByIdAndUpdate(
        salaEnsayoId,
        updatePayloadF,
        { new: true }
    ).exec();

    if (!updated) {
        throw new ModelNotFoundException();
    }
    
    return this.mapToSalaDeEnsayo(updated);
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
    },
    {new: true})
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

//actualizar nuevas imagenes de sala de ensayo
async updateSalaImages(salaEnsayoId: string, imagesToUpdate: UpdateImageDto): Promise<SalaDeEnsayo> {
    
    // Validamos que el array de imágenes no sea nulo ni indefinido
    if (!imagesToUpdate || !imagesToUpdate.images) {
        throw new Error('El objeto de imágenes no puede ser nulo.');
    }

     // Validamos que el array de imágenes no sea nulo ni indefinido
    if (!imagesToUpdate || !imagesToUpdate.images || imagesToUpdate.images.length === 0) {
        throw new Error('El objeto de imágenes no puede ser nulo o vacío.');
    }
    
    // Convertir los IDs de las imágenes a ObjectIds de Mongoose
    const newImageObjectIds = imagesToUpdate.images.map(id => new Types.ObjectId(id));

    const updated = await SalaDeEnsayoModel.findByIdAndUpdate(
        salaEnsayoId,
        {
            // Usa $push con $each para agregar múltiples elementos al array 'imagenes'
            $push: { imagenes: { $each: newImageObjectIds } }
        },
        { 
            new: true, // Devuelve el documento actualizado
        }
    ).exec();

    if (!updated) {
        throw new ModelNotFoundException(); 
    }

    return this.mapToSalaDeEnsayo(updated);
}

mapToSalaDeEnsayoImagen(document: SalaDeEnsayoDoc): SalaDeEnsayo {

        const imagenesFormatoCorrectoParaInterfaz = document.imagenes.map(id => ({ type: id.toString() }));

    return{
        id: document._id as unknown as string,
        nameSalaEnsayo: document.nameSalaEnsayo,
        calleDireccion: document.calleDireccion,
        precioHora: document.precioHora, 
        numeroDireccion: document.numeroDireccion,
        imagenes: document.imagenes,
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
        enabledHistory: document.enabledHistory,
        horarios: document.horarios

    }
} 

mapToSalaDeEnsayo(document: SalaDeEnsayoDoc): SalaDeEnsayo {
    return{
        id: document._id as unknown as string,
        nameSalaEnsayo: document.nameSalaEnsayo,
        calleDireccion: document.calleDireccion,
        precioHora: document.precioHora, 
        numeroDireccion: document.numeroDireccion,
        imagenes:document.imagenes || [],
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
        enabledHistory: document.enabledHistory,
        horarios: document.horarios

    }
}

mapToSalaDeEnsayoPaginated(document: SalaDeEnsayoDoc, total:number): any {
    return{
        total:total,
        id: document._id as unknown as string,
        nameSalaEnsayo: document.nameSalaEnsayo,
        calleDireccion: document.calleDireccion,
        precioHora: document.precioHora, 
        numeroDireccion: document.numeroDireccion,
        imagenes:document.imagenes,
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
        enabledHistory: document.enabledHistory,
        horarios: document.horarios

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
    const idArtist = new mongoose.Types.ObjectId(artistId);
    return (await OpinionModel.find({idArtist: idArtist}).populate("idUser").exec())
    .map((doc: OpinionDoc)=>{
        return this.mapToOpinion(doc)
    })
}

async getOpinionByRoom(idRoom: string): Promise<Array<Opinion>>{
    const idroom = mongoose.Types.ObjectId(idRoom);

    const opinionDoc = await OpinionModel.find({idRoom: idroom }).exec()
    console.log('dao getted opinion to room: ', opinionDoc)
    if(!opinionDoc) throw new ModelNotFoundException()
    const opinionDto: Opinion[] = opinionDoc.map((doc: OpinionDoc)=>{
        return this.mapToOpinion(doc)
    })
    return opinionDto


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