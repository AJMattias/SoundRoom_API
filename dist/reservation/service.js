"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.instance = exports.ReservationService = void 0;
const dao = __importStar(require("./dao"));
const model_1 = require("./model");
const Email = __importStar(require("../server/MailCtrl"));
const model_2 = require("../sala_de_ensayo/model");
var mongoose = require('mongoose');
class ReservationService {
    constructor(reservationDao) {
        // helper parsea
        this.obtenerNombreDelMes = (mes) => {
            const nombresDeMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
            return nombresDeMeses[mes];
        };
        this.dao = reservationDao;
    }
    mapToDto(reservation) {
        return {
            createdAt: reservation.createdAt,
            deletedAt: reservation.deletedAt,
            id: reservation.id,
            hsStart: reservation.hsStart,
            hsEnd: reservation.hsEnd,
            idOwner: reservation.idOwner,
            idUser: reservation.idUser,
            idRoom: reservation.idRoom,
            canceled: reservation.canceled,
            canceledDate: reservation.canceledDate,
            date: reservation.date,
            totalPrice: reservation.totalPrice
        };
    }
    async sendMailPiola(to, message) {
        const mailOptions = {
            from: 'soundroomapp@gmail.com',
            to: to,
            subject: "Reserva de Sala de ensayo",
            html: '<div id=":pf" class="a3s aiL "><table><tbody> <tr> <td style="padding:16px 24px"> <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%"> <tbody> <tr> <td> <table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="auto"> <tbody> <tr> <td> <img alt="Imagen de SoundRoom" border="0" height="70" width="70" src="https://fs-01.cyberdrop.to/SoundRoom_logo-X6fFVkX9.png" style="border-radius:50%;outline:none;color:#ffffff;max-width:unset!important;text-decoration:none" class="CToWUd"></a></td> </tr> </tbody> </table></td> </tr> <tr> <td> <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" align="center" style="max-width:396px;padding-bottom:4px;text-align:center"> <tbody> <tr> <td><h2 style="margin:0;color:#262626;font-weight:400;font-size:16px;line-height:1.5">' + "Usted ha creado la cuenta exitosamente. Gracias por elegir SoundRoom" + '</h2></td> </tr> </tbody> </table></td> </tr></tbody></table></div>',
            text: message,
            //borrar todo html en caso de que se rompa je
        };
        await Email.sendEmailAsync(mailOptions);
    }
    async createReservation(dto, email) {
        const reservation = await this.dao.store({
            createdAt: new Date(),
            deletedAt: new Date(),
            hsStart: dto.hsStart,
            hsEnd: dto.hsEnd,
            canceled: "false",
            idOwner: dto.idOwner,
            idRoom: dto.idRoom,
            idUser: dto.idUser,
            date: dto.date,
            totalPrice: dto.totalPrice
        });
        const msg = "Usted ha realizado una reserva exitosamente. Gracias por elegir SoundRoom";
        //await this.sendMailPiola(email, msg )
        return this.mapToDto(reservation);
    }
    async UpdateReservation(reservationId, dto) {
        const toUpdate = await this.dao.findById(reservationId);
        return this.mapToDto(await this.dao.update(reservationId, {
            createdAt: new Date(),
            deletedAt: new Date(),
            hsStart: dto.hsStart,
            hsEnd: dto.hsEnd,
            canceled: "false",
            idOwner: dto.idOwner,
            idRoom: dto.idRoom,
            idUser: dto.idUser,
            date: dto.date,
            totalPrice: dto.totalPrice
        }));
    }
    async cancelReservation(reservationId, dto, email) {
        const toUpdate = await this.dao.findById(reservationId);
        const canceledReservation = await this.dao.cancel(reservationId, {
            createdAt: dto.createdAt,
            deletedAt: dto.deletedAt,
            hsStart: dto.hsStart,
            hsEnd: dto.hsEnd,
            canceled: "true",
            idOwner: dto.idOwner,
            idRoom: dto.idRoom,
            idUser: dto.idUser,
            date: dto.date,
            totalPrice: dto.totalPrice,
            canceledDate: new Date()
        });
        let msg = `Usted ha cancelado la reserva del dia ${dto.date}  a las ${dto.hsStart}exitosamente. Gracias por elegir SoundRoom`;
        await this.sendMailPiola(email, `Usted ha cancelado la reserva del dia ${dto.date}  a las ${dto.hsStart}exitosamente. Gracias por elegir SoundRoom`);
        return this.mapToDto(canceledReservation);
    }
    async getAll() {
        const reservations = await this.dao.getAll();
        return reservations.map((reservation) => {
            return this.mapToDto(reservation);
        });
    }
    async getReservationById(id) {
        const reservation = await this.dao.getById(id);
        return this.mapToDto(reservation);
    }
    async getReservationByOwnerAndArtist(idOwner, idArtist) {
        const reservations = await this.dao.getByOwnerAndArtist(idOwner, idArtist);
        return reservations.map((reservation) => {
            return this.mapToDto(reservation);
        });
    }
    async getReservationByOwner(ownerId) {
        const reservations = await this.dao.getByOwnerA(ownerId);
        return reservations.map((reservation) => {
            return this.mapToDto(reservation);
        });
    }
    async getReservationByOwnerCanceled(ownerId) {
        const reservations = await this.dao.getByOwnerACanceled(ownerId);
        return reservations.map((reservation) => {
            return this.mapToDto(reservation);
        });
    }
    async getReservationByUser(userId) {
        const reservations = await this.dao.getByUser(userId);
        return reservations.map((reservation) => {
            return this.mapToDto(reservation);
        });
    }
    async getReservationByUserAndRoom(userId, idRoom) {
        const reservations = await this.dao.getByUserAndRoom(userId, idRoom);
        return reservations.map((reservation) => {
            return this.mapToDto(reservation);
        });
    }
    async getReservationByUserCanceled(userId) {
        const reservations = await this.dao.getByUserCanceled(userId);
        return reservations.map((reservation) => {
            return this.mapToDto(reservation);
        });
    }
    async getReservationByRoom(roomId) {
        const reservations = await this.dao.getByRoom(roomId);
        console.log('reservations: ', reservations);
        return reservations.map((reservation) => {
            return this.mapToDto(reservation);
        });
    }
    async getReservationByRoomCanceled(roomId) {
        const reservations = await this.dao.getByRoomCanceled(roomId);
        return reservations.map((reservation) => {
            return this.mapToDto(reservation);
        });
    }
    async getReservasPorMes(idRoom, fechaInicioStr, fechaFinStr) {
        try {
            //console.log(`Buscando sala con id: ${idRoom}`);
            // Convertir las fechas de string a Date
            const fechaInicio = new Date(fechaInicioStr);
            const fechaFin = new Date(fechaFinStr);
            // Obtener la sala por idRoom
            const room = await model_2.SalaDeEnsayoModel.findById(idRoom);
            if (!room) {
                throw new Error('Sala no encontrada');
            }
            // Crear arrays para labels y data
            let labels = [];
            let data = [];
            // Generar la lista de todos los meses entre fechaInicio y fechaFin
            let current = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), 1);
            //console.log('current month: ', current)
            let end = new Date(fechaFin.getFullYear(), fechaFin.getMonth(), 1);
            //console.log('last month: ', end)
            while (current <= end) {
                const mes = current.toISOString().substring(0, 7); // formato YYYY-MM
                if (current >= fechaInicio && current <= fechaFin) {
                    labels.push(this.getMonthAbbreviation(mes));
                    data.push(0); // Inicializar a 0
                }
                current.setMonth(current.getMonth() + 1);
                //console.log('labels: ', labels);
            }
            // Encontrar las reservas que coincidan con las condiciones
            const reservas = await model_1.ReservationModel.find({
                idRoom: idRoom,
                canceled: 'false',
                createdAt: { $gte: fechaInicio, $lte: fechaFin }
            });
            //console.log(`Reservas encontradas para la sala ${idRoom}: ${reservas.length}`);
            // Agrupar las reservas por mes
            reservas.forEach(reserva => {
                const mes = reserva.createdAt.toISOString().substring(0, 7); // formato YYYY-MM
                const index = labels.findIndex(label => label === this.getMonthAbbreviation(mes));
                if (index !== -1) {
                    data[index] += 1; // Incrementar contador
                }
            });
            //console.log(`Reservas agrupadas por mes: ${JSON.stringify({ labels, data })}`);
            return {
                labels,
                datasets: [{ data }]
            };
        }
        catch (error) {
            //console.error(error);
            throw new Error('Error obteniendo las reservas por mes');
        }
    }
    //reservas canceladas reporte
    async getReservasCanceladasPorMes(idRoom, idOwner, fechaInicioStr, fechaFinStr) {
        try {
            console.log(`Buscando sala con id: ${idRoom}`);
            // Convertir las fechas de string a Date
            const fechaInicio = new Date(fechaInicioStr);
            const fechaFin = new Date(fechaFinStr);
            // Obtener la sala por idRoom
            const room = await model_2.SalaDeEnsayoModel.findById(idRoom);
            if (!room) {
                throw new Error('Sala no encontrada');
            }
            // Crear arrays para labels y data
            let labels = [];
            let data = [];
            // Generar la lista de todos los meses entre fechaInicio y fechaFin
            let current = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), 1);
            console.log('current month: ', current);
            let end = new Date(fechaFin.getFullYear(), fechaFin.getMonth(), 1);
            console.log('last month: ', end);
            while (current <= end) {
                const mes = current.toISOString().substring(0, 7); // formato YYYY-MM
                if (current >= fechaInicio && current <= fechaFin) {
                    labels.push(this.getMonthAbbreviation(mes));
                    data.push(0); // Inicializar a 0
                }
                current.setMonth(current.getMonth() + 1);
                console.log('labels: ', labels);
            }
            // Encontrar las reservas que coincidan con las condiciones
            const reservas = await model_1.ReservationModel.find({
                idRoom: idRoom,
                canceled: 'true',
                createdAt: { $gte: fechaInicio, $lte: fechaFin }
            });
            console.log(`Reservas encontradas para la sala ${idRoom}: ${reservas.length}`);
            // Agrupar las reservas por mes
            reservas.forEach(reserva => {
                const mes = reserva.createdAt.toISOString().substring(0, 7); // formato YYYY-MM
                const index = labels.findIndex(label => label === this.getMonthAbbreviation(mes));
                if (index !== -1) {
                    data[index] += 1; // Incrementar contador
                }
            });
            console.log(`Reservas agrupadas por mes: ${JSON.stringify({ labels, data })}`);
            return {
                labels,
                datasets: [{ data }]
            };
        }
        catch (error) {
            console.error(error);
            throw new Error('Error obteniendo las reservas por mes');
        }
    }
    getMonthAbbreviation(month) {
        const monthAbbreviations = [
            "Ene", "Feb", "Mar", "Abr", "May", "Jun",
            "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
        ];
        // const [year, monthNumber] = month.split("-");
        // return monthAbbreviations[parseInt(monthNumber, 10) - 1];
        const yearMonth = month.split("-");
        const monthIndex = parseInt(yearMonth[1], 10) - 1; // Convertir el mes en índice (0-11)
        return monthAbbreviations[monthIndex];
    }
}
exports.ReservationService = ReservationService;
exports.instance = new ReservationService(dao.instance);
