import { ModelNotFoundException } from "../common/exception/exception";
import { CreateImagenDto } from "./dto";
import { Imagen, ImagenDoc, ImagenModel } from "./model";
import mongoose from "mongoose";
import {StringUtils} from "../common/utils/string_utils"


export class ImagenDao{

    //mapeo de imagenDoc a Imagen
    mapToImagen(document: ImagenDoc): Imagen{
        return{
            id: document._id,
            url: document.url,
            titulo: document.titulo,
            descripcion: document.descripcion,
            visible: document.visible,
            createdAt: document.createdAt,
            deletedAt: document.deletedAt,
            public_id: document.public_id
        }
    }
    
    //store a new imagen
    async createImagen(imagen: CreateImagenDto):Promise<Imagen>{
        const imagenDoc = await ImagenModel.create({
            titulo: imagen.titulo,
            descripcion: imagen.descripcion,
            url: imagen.url,
            createdAt:new Date(),
            visible: true,
            public_id: imagen.public_id
        })
        return this.mapToImagen(imagenDoc)
    }

    //get all images visible
    async getAll():Promise<Array<Imagen>>{
        return(await ImagenModel.find({ visible: true }).exec())
        .map((doc: ImagenDoc)=>{
            return this.mapToImagen(doc)
        })
    }

    async getAllRemoved():Promise<Array<Imagen>>{
        // const query = ImagenModel.find({ visible: true });
        // query.where('deletedAt').equals(null);
        // const resultados = await query.exec();
        // return(await ImagenModel.find({ visible: true }).exec())
        // .map((doc: ImagenDoc)=>{
        //     return this.mapToImagen(doc)
        // })
        return(await ImagenModel.find({ visible: false }).exec())
        .map((doc: ImagenDoc)=>{
            return this.mapToImagen(doc)
        })
    }

    async recover(id: string): Promise<Imagen> {
    const query = { _id: id }
        const updated = await ImagenModel.findOneAndUpdate(query , {
            visible: true
        }, {new: true}).exec()
        if(!updated){
            throw new ModelNotFoundException()
        }
        return this.mapToImagen(updated)
}

    async findById(id: string):Promise<Imagen>{
        const _id = mongoose.Types.ObjectId(id)
        const model = await ImagenModel.findById({_id}).exec()
        if(!model) throw new ModelNotFoundException()
        return this.mapToImagen(model)
    }
    
    async updateImagen(idImage:string, data:CreateImagenDto): Promise<Imagen>{
        const query = { _id: idImage }
        const updated = await ImagenModel.findOneAndUpdate(query , {
            titulo: data.titulo,
            descripcion: data.descripcion,
            createdAt: data.createdAt,
            visible: data.visible
        }, {new: true}).exec()
        if(!updated){
            throw new ModelNotFoundException()
        }
        return this.mapToImagen(updated)
    
    }
    async deleteImagen(id:string, data:CreateImagenDto): Promise<Imagen>{
        const deleted = await ImagenModel.findByIdAndUpdate(id , {
            titulo: data.titulo,
            descripcion: data.descripcion,
            url: data.url,
            createdAt: data.createdAt,
            deletedAt: data.deletedAt,
            visible: false
        }).exec()
        if(!deleted){
            throw new ModelNotFoundException()
        }
        return this.mapToImagen(deleted)
    
    }

    async removeImage(id: string): Promise<boolean>{
        const imagen = await ImagenModel.findByIdAndRemove(id)
        if(imagen){
            return true
        }else{
            return false
        }
}
}

export const instance = new ImagenDao()