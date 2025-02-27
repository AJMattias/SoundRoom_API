import mongoose from "mongoose"
import {
    Schema,
    Document,
    ObjectId
} from "mongoose"

export interface Comodidad{
    name: string;
    createdAt : Date;
    deletedAt?: Date;
}

export interface ComodidadDoc extends Document{
    name: string;
    createdAt: Date;
    deletedAt?: Date;
}

export const ComodidadSchema = new Schema({
    name: {type: String, unique: true},
    createdAt: Date
});

export const ComodidadModel = mongoose.model<ComodidadDoc>("Comodidad", ComodidadSchema)