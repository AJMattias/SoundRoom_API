import mongoose from "mongoose"
import {
    Schema,
    Document,
    ObjectId
} from "mongoose"

export interface EstadoUsuario{
    id: string;
    createdAt: Date;
    deletedAt: Date;
    estado: string
}

export interface EstadoUsuarioDoc extends Document{
    _id: string;
    createdAt: Date;
    deletedAt: Date;
    estado: string
}

export const EstadoUsuarioSchema = new Schema({
    createdAt: Date,
    deletedAt: Date,
    estado: String
})

export const EstadoUsuarioModel = mongoose.model<EstadoUsuarioDoc>("EstadoUsuario", EstadoUsuarioSchema)
