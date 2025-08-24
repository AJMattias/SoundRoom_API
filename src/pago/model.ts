import mongoose from "mongoose"
import {
    Schema,
    Document,
    ObjectId
} from "mongoose"

export interface Pago{
    id: string,
    createdAt: Date,
    name: string, 
    ccv: string,
    numeroTarjeta: string,
    fechaVencimiento: string,
    idUser: string,
    idSala: string,
    idReservation: string
}

export interface PagoDoc extends Document{
    _id: string,
    createdAt: Date,
    name: string, 
    ccv: string,
    numeroTarjeta: string,
    fechaVencimiento: string,
    idUser: string,
    idSala: string,
    idReservation: string
}

export const PagoSchema = new Schema({
    createdAt: Date,
    name: String, 
    ccv: String,
    numeroTarjeta: String,
    fechaVencimiento: String,
    idUser:  {type: Schema.Types.ObjectId,
        ref:"User"},
    idSala:  {type: Schema.Types.ObjectId,
        ref:"User"},
    idReservation: {type: Schema.Types.ObjectId,
        ref:"Reservation"},
})

export const PagoModel = mongoose.model<PagoDoc>("Pago", PagoSchema)