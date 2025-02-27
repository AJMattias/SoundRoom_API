import mongoose  from "mongoose"
import{
    Schema, 
    Document, 
    ObjectId
} from 'mongoose'

export interface SalaDeEnsayo{
    id: string;
    nameSalaEnsayo: string;
    calleDireccion: string;
    numeroDireccion: number;
    duracionTurno: number;
    precioHora: number;
    idImagen?: string;
    createdAt: Date;
    deletedAt?: Date;
    idOwner: string;
    idLocality: string;
    idType: string;
    //enabled: boolean;
    enabled: string;
    descripcion: string;
    comodidades:[{type: string}];
    opiniones: [{type: string, unique: true}];
    enabledHistory: [{ status: string; dateFrom: Date, dateTo: Date }]; 

}

export interface SalaDeEnsayoDoc extends Document{
    _id: string;
    nameSalaEnsayo: string;
    calleDireccion: string;
    numeroDireccion: number;
    precioHora: number;
    duracionTurno: number;
    idImagen?: string;
    createdAt: Date;
    deletedAt?: Date;
    idOwner: ObjectId;
    idLocality: ObjectId;
    idType: ObjectId;
    //enabled: boolean;
    enabled: string;
    descripcion: string;
    comodidades:[{type: string}];
    opiniones: [{type: string, unique: true}];
    enabledHistory:[{ status: string; dateFrom: Date, dateTo: Date }];

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
    //enabled: boolean;
    enabled: String,
    comodidades:  { type: [String] },
    descripcion: { 
        type: String,
        maxlength: 300
    },
   
    idImagen:{
        type: Schema.Types.ObjectId,
        ref: "Imagen",
    },
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
    }] 
})
// index for another search room call to db
//SalaDeEnsayoSchema.index({ nameSalaEnsayo: 'text' });


export const SalaDeEnsayoModel = mongoose.model<SalaDeEnsayoDoc>("Sala_De_Ensayo", SalaDeEnsayoSchema)

 //TODO 
    /** crear entidad anidada opinion con los
     * atributos opinion y rating( o estrellas de 1 a 5)
     * y fecha created y deleted or modify.
     * Tambien un endpoint para obtener las reservas de una sala
     * Para que funcione la pantalla RoomScreen
    */

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

export const OpinionModel = mongoose.model<OpinionDoc>("Opinion", OpinionSchema)
