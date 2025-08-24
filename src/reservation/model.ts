import mongoose from "mongoose"
import {
    Schema,
    Document,
    ObjectId
} from "mongoose"


export interface Reservation{
    id: string,
    createdAt: Date,
    deletedAt:Date,
    idRoom: string,
    idOwner: string,
    idUser: string,
    hsStart: string,
    hsEnd: string,
    canceledDate: Date,
    canceled: string,
    date: Date,
    totalPrice: number
,}

export interface ReservationDoc extends Document{
    _id: string,
    createdAt: Date,
    deletedAt:Date,
    idRoom: string,
    idOwner: string,
    idUser: string,
    hsStart: string,
    hsEnd: string,
    canceledDate: Date,
    canceled: string,
    date: Date,
    totalPrice: number
}

export const ReservationSchema = new Schema({
    createdAt: Date,
    deletedAt: Date,
    hsStart: String,
    hsEnd: String,
    date: Date,
    totalPrice: Number,
    canceled: String,
    canceledDate: Date,
    //TODO agregar canceledDate: Date. Idem a docs, reservation, y dtos
    idOwner: {type: Schema.Types.ObjectId,
        ref:"User"},
    idUser: {type: Schema.Types.ObjectId,
        ref:"User"},
    idRoom: {type: Schema.Types.ObjectId,
        ref:"Sala_De_Ensayo"},
})

export const ReservationModel = mongoose.model<ReservationDoc>("Reservation", ReservationSchema)