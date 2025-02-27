import { Comision } from "./model"; 

export class ComisionDto{
    id: string;
    porcentaje: number;
    createdAt: Date;
    deletedAt?: Date;
    enabled: string;

    constructor(comision: Comision){
        this.id= comision.id
        this.porcentaje= comision.porcentaje
        this.createdAt= comision.createdAt
        this.deletedAt= comision.deletedAt
        this.enabled= comision.enabled
    }
}

export interface CreateComisionDto{
    id?: string
    porcentaje: number;
    enabled?: string;
    createdAt?: Date;
    deletedAt?: Date
}
