"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instance = exports.ReservationDao = void 0;
const exception_1 = require("../common/exception/exception");
const model_1 = require("./model");
var mongoose = require('mongoose');
class ReservationDao {
    constructor() {
        // helper parsea
        this.obtenerNombreDelMes = (mes) => {
            const nombresDeMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
            return nombresDeMeses[mes];
        };
    }
    mapToReservation(document) {
        return {
            createdAt: document.createdAt,
            deletedAt: document.deletedAt,
            hsStart: document.hsStart,
            hsEnd: document.hsEnd,
            idOwner: document.idOwner,
            idUser: document.idUser,
            idRoom: document.idRoom,
            id: document._id,
            canceled: document.canceled,
            date: document.date,
            totalPrice: document.totalPrice,
            canceledDate: document.canceledDate
        };
    }
    async store(reservation) {
        const reservationDoc = await model_1.ReservationModel.create({
            createdAt: reservation.createdAt,
            deletedAt: null,
            hsStart: new Date(reservation.hsStart),
            hsEnd: new Date(reservation.hsEnd),
            idOwner: reservation.idOwner,
            idUser: reservation.idUser,
            idRoom: reservation.idRoom,
            canceled: reservation.canceled,
            date: reservation.date,
            totalPrice: reservation.totalPrice
        });
        return this.mapToReservation(reservationDoc);
    }
    async getAll() {
        return (await model_1.ReservationModel.find({ canceled: "false" }).populate("idOwner")
            .populate("idUser").populate("idRooom").exec())
            .map((doc) => {
            return this.mapToReservation(doc);
        });
    }
    async getByUser(userId) {
        return (await model_1.ReservationModel.find({ canceled: "false", idUser: userId }).populate("idOwner")
            .populate("idRoom"))
            .map((doc) => {
            return this.mapToReservation(doc);
        });
    }
    async getByUserAndRoom(userId, idRoom) {
        const idroom = mongoose.Types.ObjectId(idRoom);
        //idUser hace la reserva
        const iduser = mongoose.Types.ObjectId(userId);
        return (await model_1.ReservationModel.find({ canceled: "false", idUser: iduser, idRoom: idroom }))
            .map((doc) => {
            return this.mapToReservation(doc);
        });
    }
    async getById(reservationId) {
        const model = await model_1.ReservationModel.findById(reservationId).populate('idRoom').exec();
        if (!model)
            throw new exception_1.ModelNotFoundException();
        return this.mapToReservation(model);
    }
    async getByOwnerAndArtist(idOwner, idArtist) {
        return (await model_1.ReservationModel.find({ idUser: idArtist, idOwner: idOwner }))
            .map((doc) => {
            return this.mapToReservation(doc);
        });
    }
    async getByOwnerA(ownerId) {
        return (await model_1.ReservationModel.find({
            idOwner: ownerId,
        })
            .populate("idUser") // usuario que hizo la reserva
            .populate({
            path: "idRoom",
            populate: {
                path: "imagenes",
                model: "Imagen", // nombre del modelo referenciado
            },
        })
            .exec()).map((doc) => {
            return this.mapToReservation(doc);
        });
    }
    async getByOwnerACanceled(ownerId) {
        return (await model_1.ReservationModel.find({ canceled: "true", idOwner: ownerId }).exec())
            .map((doc) => {
            return this.mapToReservation(doc);
        });
    }
    async getByUserCanceled(userId) {
        return (await model_1.ReservationModel.find({ canceled: "true", idUser: userId }).exec())
            .map((doc) => {
            return this.mapToReservation(doc);
        });
    }
    async getByRoom(roomId) {
        return (await model_1.ReservationModel.find({ canceled: "false", idRoom: roomId }).exec())
            .map((doc) => {
            return this.mapToReservation(doc);
        });
    }
    async getByRoomCanceled(roomId) {
        return (await model_1.ReservationModel.find({ canceled: "true", idRoom: roomId }).exec())
            .map((doc) => {
            return this.mapToReservation(doc);
        });
    }
    async findById(reservationId) {
        const model = await model_1.ReservationModel.findById(reservationId).exec();
        if (!model)
            throw new exception_1.ModelNotFoundException();
        return this.mapToReservation(model);
    }
    async create(reservation) {
        const updated = await model_1.ReservationModel.create({
            createdAt: reservation.createdAt,
            hsStart: reservation.hsStart,
            hsEnd: reservation.hsEnd,
            idOwner: reservation.idOwner,
            idUser: reservation.idUser,
            idRoom: reservation.idRoom,
            canceled: reservation.canceled,
            date: reservation.date,
            totalPrice: reservation.totalPrice
        });
        if (!updated)
            throw new exception_1.ModelNotFoundException();
        return this.mapToReservation(updated);
    }
    async update(reservationId, reservation) {
        const updated = await model_1.ReservationModel.findByIdAndUpdate(reservationId, {
            createdAt: reservation.createdAt,
            hsStart: reservation.hsStart,
            hsEnd: reservation.hsEnd,
            idOwner: reservation.idOwner,
            idUser: reservation.idUser,
            idRoom: reservation.idRoom,
            canceled: reservation.canceled,
            date: reservation.date,
            totalPrice: reservation.totalPrice
        }).exec();
        if (!updated)
            throw new exception_1.ModelNotFoundException();
        return this.mapToReservation(updated);
    }
    async cancel(reservationId, reservation) {
        const updated = await model_1.ReservationModel.findByIdAndUpdate(reservationId, { hsStart: reservation.hsStart,
            hsEnd: reservation.hsEnd,
            idOwner: reservation.idOwner,
            idUser: reservation.idUser,
            idRoom: reservation.idRoom,
            canceled: "true",
            date: reservation.date,
            totalPrice: reservation.totalPrice,
            canceledDate: reservation.canceledDate
        }).exec();
        if (!updated)
            throw new exception_1.ModelNotFoundException();
        return this.mapToReservation(updated);
    }
    async obtenerArtistasNuevosPorMes(fechaInicio, fechaFin) {
        try {
            // Parsear fechas
            const fechaInicioObj = new Date(fechaInicio);
            const fechaFinObj = new Date(fechaFin);
            console.log("fecha Inicio", fechaInicioObj);
            console.log("fecha Fin", fechaFinObj);
            // Obtener la diferencia en meses
            const diffMeses = (fechaFinObj.getFullYear() - fechaInicioObj.getFullYear()) * 12 + fechaFinObj.getMonth() - fechaInicioObj.getMonth() + 1;
            // Inicializar el array de resultados
            const resultados = [];
            // Consultar la cantidad de documentos por mes
            for (let i = 0; i < diffMeses; i++) {
                const fechaActual = new Date(fechaInicioObj.getFullYear(), fechaInicioObj.getMonth() + i, 1);
                const fechaSiguiente = new Date(fechaInicioObj.getFullYear(), fechaInicioObj.getMonth() + i + 1, 1);
                const cantidad = await model_1.ReservationModel.countDocuments({
                    createdAt: {
                        $gte: fechaActual,
                        $lt: fechaSiguiente
                    },
                    userType: "artista"
                });
                const nombreDelMes = this.obtenerNombreDelMes(fechaActual.getMonth());
                resultados.push({ año: fechaActual.getFullYear(), mes: //fechaActual.getMonth() + 1
                    nombreDelMes,
                    cantidad });
            }
            console.log(resultados);
            return resultados;
        }
        catch (error) {
            console.error('Error al obtener la cantidad de documentos por mes:', error);
            throw error;
        }
    }
}
exports.ReservationDao = ReservationDao;
exports.instance = new ReservationDao();
