import { Pago } from "./model";

export class PagoDto{
    id: string;
    createdAt?: Date;
    name: string; 
    ccv: string;
    numeroTarjeta: string;
    fechaVencimiento: string;
    idUser: string;
    idSala: string;
    idReservation: string

    constructor ( pago: Pago){
        this.id= pago.id
        this.createdAt = pago.createdAt
        this.name= pago.name
        this.ccv= pago.ccv
        this.numeroTarjeta= pago.numeroTarjeta
        this.fechaVencimiento= pago.fechaVencimiento
        this.idUser= pago.idUser
        this.idSala= pago.idSala
        this.idReservation= pago.idReservation
    }
}

export interface CreatePago{
    createdAt?: Date;
    name: string; 
    ccv: Number;
    numeroTarjeta: Number;
    fechaVencimiento: string;
    idUser: string;
    idSala: string;
    idReservation: string
}