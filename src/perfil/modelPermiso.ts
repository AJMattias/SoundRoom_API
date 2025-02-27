import mongoose from "mongoose"
import {Schema, Document, ObjectId} from "mongoose"


export interface Permiso{
    id: string;
    name: string;
    createdAt?: Date;
    deletedAt?: Date;
    enabled: string;
}

export interface PermisoDoc extends Document{
    _id: string;
    name: string;
    createdAt: Date;
    deletedAt?: Date;
    enabled: string;
}

export const PermisoSchema = new Schema({
    name:{
        type: String,
        unique: true,
        required: true,
    },
    createdAt: Date,
    deletedAt: Date,
    enabled: String,
});

export const PermisoModel = mongoose.model<PermisoDoc>("Permiso", PermisoSchema)
