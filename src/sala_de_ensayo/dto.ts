import { Imagen } from "../imagen/model";
import { ImagenDto } from "../imagen/dto";
import { Horario, Opinion, SalaDeEnsayo } from "./model";

export class SalaDeEnsayoDto{
    id?: string;
    nameSalaEnsayo?: string;
    calleDireccion?: string;
    numeroDireccion?: number;
    createdAt?: Date;
    duracionTurno?: number;
    precioHora?: number;
    idOwner?: string;
    idType?: string;
    idLocality?: string;
    enabled?: string;
    descripcion?: string;
    imagenes?: Imagen[];
    comodidades?:[{type: string}];
    opiniones:[{type: string}];
    enabledHistory?: { status: string;dateFrom: Date, dateTo: Date}[];
    horarios?: Horario[];

    constructor(sala: SalaDeEnsayo){
        this.id = sala.id
        this.nameSalaEnsayo= sala.nameSalaEnsayo;
        this.calleDireccion = sala.calleDireccion;
        this.numeroDireccion = sala.numeroDireccion;
        this.duracionTurno = sala.duracionTurno;
        this.precioHora = sala.precioHora;
        this.imagenes = sala.imagenes;
        this.idOwner = sala.idOwner;
        this.idType = sala.idType;
        this.idLocality = sala.idLocality;
        this.createdAt = sala.createdAt;
        this.descripcion = sala.descripcion;
        this.comodidades = sala.comodidades;
        this.opiniones = sala.opiniones;
        this.enabled = sala.enabled;
        this.enabledHistory = sala.enabledHistory;
        this.horarios = sala.horarios;
    }
}

export interface PaginatedResponseDto<T> {
    page: number; // Página actual
    limit: number; // Límite de resultados por página
    total: number; // Total de resultados coincidentes (sin paginar)
    data: T[]; // El array de resultados (SalaDeEnsayoDto[])
}

// Definición para el DAO, ya que trabaja con entidades de dominio (SalaDeEnsayo)
type DaoPaginationResult = { 
    data: Array<SalaDeEnsayo>; // Entidades de dominio sin mapear a DTO
    total: number;
};

export interface UpdateSalaDeEnsayoDto2{
    nameSalaEnsayo?: string,
    calleDireccion?: string,
    numeroDireccion?: number,
    descripcion?: string,
    precioHora?: number,
    duracionTurno?: number,
    createdAt?: Date,
    deletedAt?: Date,
    comodidades?: undefined; 
    idOwner?: string;
    idType?: string; 
    opiniones?: string; 
    enabled?: string;
    imagenes?: ImagenDto[];
    enabledHistory?: { status: string; dateFrom: Date, dateTo: Date }[],
    horarios?: Horario[];
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
    enabled: string;
    imagenes: ImagenDto[];
    enabledHistory?: { status: string; dateFrom: Date, dateTo: Date }[]
    horarios?: Horario[];
}

export interface CreateSalaDeEnsayoDto{
    nameSalaEnsayo: string;
    calleDireccion: string;
    createdAt: Date;
    idImagen?: string;
    duracionTurno: number;
    precioHora: number;
    idOwner?: string;
    idType: string;
    enabled: string;
    descripcion: string;
    comodidades:undefined;
    imagenes: ImagenDto[];
    enabledHistory?: { status: string; dateFrom: Date, dateTo: Date }[]
    horarios?: Horario[];
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
    imagenes: ImagenDto[];
    horarios?: Horario[];
    opiniones?: Opinion[];
}

export interface UpdateSalaDeEnsayoDto{
    name: string,
    calleDireccion: string,
    numeroDireccion: number,
    precioHora: number,
    duracionturno: number,
    comodidades:undefined;
    enabledHistory?: { status: string; dateFrom: Date, dateTo: Date }[],
    imagenes: ImagenDto[];
    horarios?: Horario[];
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

export interface UpdateImageDto {
  images: string[];
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

