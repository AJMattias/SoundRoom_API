import { Permiso } from "./modelPermiso";
import { Perfil} from "./models"


export class PerfilDto{
    name: string;
    id: string;
    createdAt?: Date;
    deletedAt?: Date;
    permisos?: [{type: string}];



    constructor(perfil: Perfil){
        this.name = perfil.name;
        this.id = perfil.id;
        this.permisos = perfil.permisos;
    }
}
export class PerfilPermisoDto{
    name: string;
    id: string;
    createdAt?: Date;
    deletedAt?: Date;
    permisos?: [{type: string}];


    constructor(perfil: Perfil){
        this.name = perfil.name;
        this.id = perfil.id;
        this.permisos = perfil.permisos;
    } 
}

export class PermisoDto{
    id: string;
    name: string;
    createdAt?: Date;
    enabled: string;

    constructor(permiso: Permiso){
        this.id = permiso.id
        this.name = permiso.name
        this.enabled = permiso.enabled
    //    this.createdAt = permiso.createdAt
    }
}

export interface CreatePermisoDto{
    name: string;
    createdAt?: Date;
    deletedAt?: Date;
    enabled: string;
}

export interface CreatePerfilDto{
    name: string;
    createdAt?: Date;
    deletedAt?: Date;
    //permisos?: undefined;
    permisos?: string[];
}

export interface CreatePerfilDto2{
    name: string;
    createdAt?: Date;
    deletedAt?: Date;
    //permisos?: undefined;
    permisos: string[];
}

