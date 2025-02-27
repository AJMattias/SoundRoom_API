import mongoose from 'mongoose'
import {
    Schema,
    Document,
    ObjectId
} from "mongoose"

export interface Comision{
    id: string,
    porcentaje: number,
    createdAt: Date,
    deletedAt?:Date,
    enabled: string
}

export interface ComisionDoc extends Document{
    id: string;
    porcentaje: number;
    createdAt: Date;
    deletedAt?:Date;
    enabled: string;
}

export const ComisionSchema = new Schema({
    porcentaje: {type: Number, unique: true},
    createdAt: Date,
    deletedAt: Date,
    enabled: String
})

export const ComisionModel = mongoose.model<ComisionDoc>("Comision", ComisionSchema)