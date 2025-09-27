"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationDto = void 0;
class ReservationDto {
    constructor(reservation) {
        this.id = reservation.id;
        this.createdAt = reservation.createdAt;
        this.deletedAt = reservation.deletedAt;
        this.hsStart = reservation.hsStart;
        this.hsEnd = reservation.hsEnd;
        this.idRoom = reservation.idRoom;
        this.idOwner = reservation.idOwner;
        this.idUser = reservation.idUser;
        this.canceled = reservation.canceled;
        this.date = reservation.date;
        this.totalPrice = reservation.totalPrice;
        this.canceledDate = reservation.canceledDate;
        this.canceled = reservation.canceled;
    }
}
exports.ReservationDto = ReservationDto;
