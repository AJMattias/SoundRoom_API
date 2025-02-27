import mongoose from "mongoose"
import {
    Schema,
    Document,
    ObjectId
} from "mongoose"

export interface Type{
    id: string;
    name: string;
    createdAt : Date;
    deletedAt?: Date;
}

export interface TypeDoc extends Document{
    id: string;
    name: string;
    createdAt: Date;
    deletedAt?: Date;
}

export const TypeSchema = new Schema({
    name: {type: String, unique: true},
    createdAt: Date
});

export interface StateSalaEnsayo{
    name: string;
    createdAt : Date;
    deletedAt?: Date;
}

export interface StateSalaEnsayoDoc extends Document{
    name: string;
    createdAt: Date;
    deletedAt?: Date;
}

export const StateSalaEnsayoSchema = new Schema({
    name: {type: String, unique: true},
    createdAt: Date
});

export const TypeModel = mongoose.model<TypeDoc>("Type", TypeSchema)
export const StateSalaEnsayoModel = mongoose.model<StateSalaEnsayoDoc>("StateSalaEnsayo", StateSalaEnsayoSchema)