import { Imagen } from "./model";

export class ImagenDto{
    id?: string;
    url?: string;
    titulo: string;
    descripcion: string;
    visible?: boolean;
    createdAt?: Date;
    deletedAt?: Date;

    constructor(imagen: Imagen){
        this.url= imagen.url;
        this.titulo=imagen.titulo;
        this.descripcion=imagen.descripcion;
        this.visible=imagen.visible;
        this.createdAt= imagen.createdAt;
        this.deletedAt= imagen.deletedAt;
    }
}

export interface CreateImagenDto{
    id?: string;
    titulo: string;
    descripcion: string;
    url?: string;
    createdAt?: Date;
    deletedAt?: Date;
    visible?:boolean
}