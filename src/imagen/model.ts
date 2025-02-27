import mongoose from "mongoose"
import {
    Schema,
    Document,
    ObjectId
} from "mongoose"

export interface Imagen {
    id?: string
    url: string;
    titulo: string;
    descripcion: string;
    visible: boolean;
    createdAt: Date;
    deletedAt?: Date
}

export interface ImagenDoc extends Document{
    _id: string;
    url: string;
    titulo: string;
    descripcion: string;
    visible: boolean;
    createdAt: Date;
    deletedAt?: Date;
}

export const ImagenSchema = new Schema({
    //id: {type: String, unique: true},
    url: String,
    titulo: String,
    descripcion: String,
    visible: Boolean,
    createdAt: Date,
    deletedAt: Date
})

export const ImagenModel = mongoose.model<ImagenDoc>("Imagen", ImagenSchema)