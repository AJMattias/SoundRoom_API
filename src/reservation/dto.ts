import { Reservation } from "./model";

export class ReservationDto{
    id: string;
    createdAt: Date;
    deletedAt?:Date;
    idRoom: string;
    idOwner: string;
    idUser: string;
    hsStart: string;
    hsEnd: string;
    canceled: string;
    date: Date;
    totalPrice: number;
    canceledDate?: Date;

    constructor(reservation: Reservation){
        this.id = reservation.id
        this.createdAt = reservation.createdAt
        this.deletedAt = reservation.deletedAt
        this.hsStart = reservation.hsStart
        this.hsEnd = reservation.hsEnd
        this.idRoom = reservation.idRoom
        this.idOwner = reservation.idOwner
        this.idUser = reservation.idUser
        this.canceled = reservation.canceled
        this.date = reservation.date
        this.totalPrice = reservation.totalPrice
        this.canceledDate= reservation.canceledDate
        this.canceled = reservation.canceled
    }
}

export interface CreateReservationDto{
    createdAt?: Date;
    deletedAt?:Date;
    idRoom: string;
    idOwner: string;
    idUser: string;
    hsStart: string;
    hsEnd: string;
    canceled: string;
    date: Date;
    totalPrice: number;
    canceledDate?: Date;
}

export interface DeleteReservationDto{
    createdAt: Date;
    deletedAt:Date;
    idRoom: string;
    idOwner: string;
    idUser: string;
    hsStart: string;
    hsEnd: string;
    canceled: string;
    date: Date;
    totalPrice: number;
    canceledDate?: Date;
}