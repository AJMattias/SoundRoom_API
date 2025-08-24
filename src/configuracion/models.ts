import mongoose from "mongoose"
import {
    Schema,
    Document,
    ObjectId
} from "mongoose"

export interface Configuracion{
    tiempoBloqueo : Number;
    maximoIntentos : Number;
    porcentajeComision : Number;
    createdAt : Date;
    deletedAt?: Date;
}

export interface ConfiguracionDoc extends Document{
    tiempoBloqueo : Number;
    maximoIntentos : Number;
    porcentajeComision : Number;
    createdAt: Date;
    deletedAt?: Date;
}

export const ConfiguracionSchema = new Schema({
    tiempoBloqueo : Number,
    maximoIntentos : Number,
    porcentajeComision : Number,
    createdAt: Date,
    deletedAt: Date
});

export const ConfiguracionModel = mongoose.model<ConfiguracionDoc>("Configuracion", ConfiguracionSchema)