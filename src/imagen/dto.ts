import { Imagen } from "./model";

export class ImagenDto{
    id: string | undefined;
    url?: string;
    titulo: string;
    descripcion: string;
    public_id: string;
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
        this.public_id= imagen.public_id
    }
}

export interface CreateImagenDto{
    id?: string;
    titulo?: string;
    descripcion?: string;
    url?: string;
    public_id: string;
    createdAt?: Date;
    deletedAt?: Date;
    visible?:boolean
}

export interface UpdateImagenDto{
    id?: string;
    titulo?: string;
    descripcion?: string;
    url?: string;
    public_id?: string;
    createdAt?: Date;
    deletedAt?: Date;
    visible?:boolean
}
export interface ImagenData { // <-- ¡Aquí el cambio!
    description: string;
    enabled: boolean;
}