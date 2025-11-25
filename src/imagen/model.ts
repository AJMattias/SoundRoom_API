// import mongoose from "mongoose"
// import {
//     Schema,
//     Document,
//     ObjectId
// } from "mongoose"

// export interface Imagen {
//     id?: string
//     url: string;
//     titulo: string;
//     descripcion: string;
//     public_id: string;
//     visible: boolean;
//     createdAt: Date;
//     deletedAt?: Date
// }

// export interface ImagenDoc extends Document{
//     _id: string;
//     url: string;
//     titulo: string;
//     descripcion: string;
//     public_id: string;
//     visible: boolean;
//     createdAt: Date;
//     deletedAt?: Date;
// }

// export const ImagenSchema = new Schema({
//     //id: {type: String, unique: true},
//     url: String,
//     titulo: String,
//     descripcion: String,
//     public_id: String,
//     visible: Boolean,
//     createdAt: Date,
//     deletedAt: Date
// })

// export const ImagenModel = mongoose.model<ImagenDoc>("Imagen", ImagenSchema)

import mongoose from "mongoose"
import { Schema, Document } from "mongoose"

export interface Imagen {
    id?: string
    url: string;
    titulo: string;
    descripcion: string;
    public_id: string;
    visible: boolean;
    createdAt: Date;
    deletedAt?: Date
}

export interface ImagenDoc extends Document{
    id: string;
    url: string;
    titulo: string;
    descripcion: string;
    public_id: string;
    visible: boolean;
    createdAt: Date;
    deletedAt?: Date;
}

export const ImagenSchema = new Schema({
    url: String,
    titulo: String,
    descripcion: String,
    public_id: String,
    visible: Boolean,
    createdAt: Date,
    deletedAt: Date
})

// SOLUCIÓN: Usar 'any' para evitar el error de tipos complejos
export const ImagenModel = mongoose.model<any>("Imagen", ImagenSchema)