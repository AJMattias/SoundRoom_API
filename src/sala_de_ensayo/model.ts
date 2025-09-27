import mongoose  from "mongoose"
import{
    Schema, 
    Document, 
    ObjectId
} from 'mongoose'
import { Imagen } from "../imagen/model";

export enum DiasSemana {
  Lunes = 'Lunes',
  Martes = 'Martes',
  Miercoles = 'Miércoles',
  Jueves = 'Jueves',
  Viernes = 'Viernes',
  Sabado = 'Sábado',
  Domingo = 'Domingo'
}

export interface SalaDeEnsayo{
    id: string;
    nameSalaEnsayo: string;
    calleDireccion: string;
    numeroDireccion: number;
    duracionTurno: number;
    precioHora: number;
    createdAt: Date;
    deletedAt?: Date;
    idOwner: string;
    idLocality: string;
    idType: string;
    enabled: string;
    descripcion: string;
    imagenes: Imagen[];
    comodidades:[{type: string}];
    opiniones: [{type: string, unique: true}];
    enabledHistory: [{ status: string; dateFrom: Date, dateTo: Date }]; 
    horarios?: Horario[];

}

export interface SalaDeEnsayoDoc extends Document{
    _id: string;
    nameSalaEnsayo: string;
    calleDireccion: string;
    numeroDireccion: number;
    precioHora: number;
    duracionTurno: number;
    createdAt: Date;
    deletedAt?: Date;
    idOwner: ObjectId;
    idLocality: ObjectId;
    idType: ObjectId;
    enabled: string;
    descripcion: string;
    imagenes: Imagen[];
    comodidades:[{type: string}];
    opiniones: [{type: string, unique: true}];
    enabledHistory:[{ status: string; dateFrom: Date, dateTo: Date }];
    horarios?: Horario[];

}

export interface enabledHistoy {
    status: String;
    dateFrom: Date; 
    dateTo: Date
}

export interface enabledHistoy{
    status: String,
    dateFrom: Date, 
    dateTo: Date
}

export interface Horario {
  dia: string;
  hsInicio: string;
  hsFin: string;
  available: boolean;
}

export const enabledHistoy = new Schema({
    status: String,
    dateFrom: Date, 
    dateTo: Date
})

export const SalaDeEnsayoSchema = new Schema({
    nameSalaEnsayo: {type: String, unique: true},
    calleDireccion: String,
    numeroDireccion: Number,
    precioHora: Number,
    duracionTurno: Number,
    createdAt: Date,
    enabled: String,
    comodidades:  { type: [String] },
    descripcion: { 
        type: String,
        maxlength: 300
    },
   
    imagenes:[{
        type: [Schema.Types.ObjectId],
        ref: "Imagen",
        default:[]
    }],
    idOwner : {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    idLocality : {
        type: Schema.Types.ObjectId,
        ref: "Locality",
    },
    idType : {
        type: Schema.Types.ObjectId,
        ref: "Type",
    },
    opiniones:[{
        type: Schema.Types.ObjectId,
        ref:"Opinion"
    }],
    enabledHistory: [{
        status: String,
        dateFrom: Date, 
        dateTo: Date
    }],
    horarios: [{
        dia: { type: String, required: true },
        hsInicio: { type: String, required: true }, // formato "HH:mm"
        hsFin: { type: String, required: true },
        available: { type: Boolean, default: true }
    }]
})
// index for another search room call to db
//SalaDeEnsayoSchema.index({ nameSalaEnsayo: 'text' });


export const SalaDeEnsayoModel = mongoose.model<any>("Sala_De_Ensayo", SalaDeEnsayoSchema)


export const OpinionSchema = new Schema({ 
    descripcion: { 
        type: String,
        maxlength: 300
    },
    estrellas:{
        type: Number
    },
    createdAt: Date,
    
    idUser : {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    //nuevo diseño de documento ahora opinion tiene la sala a la que pertenece
    idRoom : {
        type: Schema.Types.ObjectId,
        ref: "Sala_De_Ensayo",
    },
    idArtist:{
        type: Schema.Types.ObjectId,
        ref: "User",
    }
})

export interface Opinion{
    id: string,
    descripcion: string,
    estrellas: number,
    idUser:  string,
    idRoom: string,
    idArtist?: string
}

export interface OpinionDoc extends Document{
    id: string,
    descripcion: string,
    estrellas: number,
    idUser:  string,
    idRoom: string,
    idArtist: string
}

export const OpinionModel = mongoose.model<any>("Opinion", OpinionSchema)
