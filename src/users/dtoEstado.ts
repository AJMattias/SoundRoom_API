import { EstadoUsuario } from "./modelEU"

export class EstadoDto{
    id: string;
    createdAt: Date;
    deletedAt: Date;
    estado: string

    constructor(estado: EstadoUsuario){
        this.id= estado.id
        this.createdAt= estado.createdAt
        this.deletedAt = estado.deletedAt
        this.estado = estado.estado
    }
}

export interface createEstadoUsuarioDto{
    createdAt: Date;
    deletedAt: Date;
    estado: string;
}