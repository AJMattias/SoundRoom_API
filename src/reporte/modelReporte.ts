import mongoose from "mongoose"
import {
    Schema,
    Document,
    ObjectId
} from "mongoose"

export interface Reporte{
    mes: number;
    cantidad:number; 
}

export interface ReportesDoc extends Document{
    _id: string;
    mes: number;
    cantidad:number;
}

export const ReportesSchema = new Schema({
    mes: Number,
    cantidad: Number
})

export const ReportesModel = mongoose.model<ReportesDoc>("Reportes", ReportesSchema)