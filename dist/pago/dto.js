"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagoDto = void 0;
class PagoDto {
    constructor(pago) {
        this.id = pago.id;
        this.createdAt = pago.createdAt;
        this.name = pago.name;
        this.ccv = pago.ccv;
        this.numeroTarjeta = pago.numeroTarjeta;
        this.fechaVencimiento = pago.fechaVencimiento;
        this.idUser = pago.idUser;
        this.idSala = pago.idSala;
        this.idReservation = pago.idReservation;
    }
}
exports.PagoDto = PagoDto;
