import { Opinion, SalaDeEnsayo } from "./model";

export class SalaDeEnsayoDto{
    id: string;
    nameSalaEnsayo: string;
    calleDireccion: string;
    numeroDireccion: number;
    createdAt?: Date;
    idImagen?: string;
    duracionTurno: number;
    precioHora: number;
    idOwner?: string;
    idType?: string;
    idLocality?: string;
    //enabled: boolean;
    enabled: string;
    descripcion: string;
    comodidades:[{type: string}];
    opiniones:[{type: string}];
    enabledHistory?: { status: string;dateFrom: Date, dateTo: Date}[];


    constructor(sala: SalaDeEnsayo){
        this.id = sala.id
        this.nameSalaEnsayo= sala.nameSalaEnsayo;
        this.calleDireccion = sala.calleDireccion;
        this.numeroDireccion = sala.numeroDireccion;
        this.duracionTurno = sala.duracionTurno;
        this.precioHora = sala.precioHora;
        this.idImagen = sala.idImagen;
        this.idOwner = sala.idOwner;
        this.idType = sala.idType;
        this.idLocality = sala.idLocality;
        this.createdAt = sala.createdAt;
        this.descripcion = sala.descripcion;
        this.comodidades = sala.comodidades;
        this.opiniones = sala.opiniones;
        this.enabled = sala.enabled;
        this.enabledHistory = sala.enabledHistory;

    }
}


export interface CreateSalaDeEnsayoDto2{
    nameSalaEnsayo: string,
    calleDireccion: string,
    numeroDireccion: number,
    descripcion: string
    precioHora: number,
    duracionTurno: number,
    createdAt?: Date,
    deletedAt?: Date,
    comodidades: undefined; 
    idOwner?: string;
    idType?: string; 
    opiniones?: string; 
    //enabled: boolean;
    enabled: string;
    enabledHistory?: { status: string; dateFrom: Date, dateTo: Date }[]

}
export interface CreateSalaDeEnsayoDto{
    nameSalaEnsayo: string;
    calleDireccion: string;
    // numeroDireccion: number;
    // idLocality: string;
    createdAt: Date;
    idImagen?: string;
    duracionTurno: number;
    precioHora: number;
    idOwner?: string;
    idType: string;
    //enabled: boolean;
    enabled: string;
    descripcion: string;
    comodidades:undefined;
    enabledHistory?: { status: string; dateFrom: Date, dateTo: Date }[]
}

export interface PopularSalaDeEnsayoDto{
    nameSalaEnsayo: string;
    calleDireccion: string;
    // numeroDireccion: number;
    // idLocality: string;
    createdAt: Date;
    idImagen?: string;
    duracionTurno: number;
    precioHora: number;
    idOwner?: string;
    idType: string;
    enabled: string;
    descripcion: string;
    comodidades:[string];
    enabledHistory?: { status: string; dateFrom: Date, dateTo: Date }[];
    salaOwner: string;
}

export interface UpdateSalaDeEnsayoDto{
    name: string,
    calleDireccion: string,
    numeroDireccion: number,
    precioHora: number,
    duracionturno: number,
    comodidades:undefined;
    enabledHistory?: { status: string; dateFrom: Date, dateTo: Date }[]
}

export interface CreateSalaDeEnsayoDtoOpinion{
    nameSalaEnsayo: string,
    calleDireccion: string,
    numeroDireccion: number,
    precioHora: number,
    opiniones?: string,
}

export interface CreateSearchSdEDto{
    idOwner:string,
    idType: string,
    //idLocality: string
}

export class OpinionDto{
    id: string;
    descripcion: string;
    estrellas: number;
    idUser:  string;
    idRoom: string;
    idArtist?: string

    constructor(opinion: Opinion){
        this.id = opinion.id,
        this.descripcion= opinion.descripcion,
        this.estrellas = opinion.estrellas,
        this.idUser = opinion.idUser,
        this.idRoom = opinion.idRoom,
        this.idArtist = opinion.idArtist
    }
}

export interface CreateOpinionDto{
    descripcion: string;
    estrellas: number;
    idUser:  string;
    idRoom: string;
    idArtist?: string;
}

export interface CreateOpinionArtistDto{
    descripcion: string;
    estrellas: number;
    idUser:  string;
    idArtist?: string;
}

export interface OpinionDto{
    id: string,
    descripcion: string;
    estrellas: number;
    idUser:  string;
    
}

export interface UpdateOpinionDto{
    descripcion: string;
    estrellas: number;
    idUser:  string
    idRoom: string;
    idArtist: string;

}

