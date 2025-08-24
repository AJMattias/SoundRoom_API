import mongoose from 'mongoose'
import {
    Schema,
    Document,
    ObjectId
} from "mongoose"

export interface EnabledHistory {
    id: string;
    status: string;
    dateFrom: Date; 
    dateTo: Date
}

export interface EnabledHistoryDoc extends Document {
    id: string;
    status: string;
    dateFrom: Date; 
    dateTo: Date
}
export const EnabledHistorySchema = new Schema({
    status: String,
    dateFrom: Date, 
    dateTo: Date
})

export interface Comision{
    id: string,
    porcentaje: number,
    createdAt: Date,
    deletedAt?:Date,
    enabled: string,
    //enabledHistory: [{ status: string; dateFrom: Date, dateTo: Date }]; 
    enabledHistory: EnabledHistory[]; // Cambiado a EnabledHistory[]
}

export interface ComisionDoc extends Document{
    id: string;
    porcentaje: number;
    createdAt: Date;
    deletedAt?:Date;
    enabled: string;
    //enabledHistory: [{ status: string; dateFrom: Date, dateTo: Date }]; 
    enabledHistory: EnabledHistory[];
}

export const ComisionSchema = new Schema({
    porcentaje: {type: Number, unique: true},
    createdAt: Date,
    deletedAt: Date,
    enabled: String,
    enabledHistory: [EnabledHistorySchema],
})

export const EnabledHistoryModel = mongoose.model<EnabledHistoryDoc>("EnabledHistory", EnabledHistorySchema)
export const ComisionModel = mongoose.model<ComisionDoc>("Comision", ComisionSchema)