import { ModelNotFoundException } from "../common/exception/exception"
import {StringUtils} from "../common/utils/string_utils"
import { ReservationModel, Reservation, ReservationSchema, ReservationDoc } from "./model"
import { CreateReservationDto, DeleteReservationDto, ReservationDto } from "./dto"
import { dangerouslyDisableDefaultSrc } from "helmet/dist/middlewares/content-security-policy"
import { UserModel } from "src/users/models"
var mongoose = require('mongoose');


export class ReservationDao{

    mapToReservation(document: ReservationDoc): Reservation{
        return{
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
    

    async store(reservation: CreateReservationDto): Promise<Reservation>{
        const reservationDoc = await ReservationModel.create(
            {
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
                
            }
        )
        return this.mapToReservation(reservationDoc)
    }

    async getAll(): Promise<Array<Reservation>>{
        return (await ReservationModel.find({canceled: "false"}).populate("idOwner")
        .populate("idUser").populate("idRooom").exec())
        .map((doc: ReservationDoc)=>{
            return this.mapToReservation(doc)
        }
        )
    }

    async getByUser(userId: string): Promise<Array<Reservation>>{
        return (await ReservationModel.find({canceled: "false", idUser: userId}).populate("idOwner")
        .populate("idRoom"))
        .map((doc: ReservationDoc)=>{
            return this.mapToReservation(doc)
        }
        )
    }

    async getByUserAndRoom(userId: string, idRoom: string): Promise<Array<Reservation>>{
        const idroom = mongoose.Types.ObjectId(idRoom);
        //idUser hace la reserva
        const iduser = mongoose.Types.ObjectId(userId);
        return (await ReservationModel.find({canceled: "false", idUser: iduser, idRoom: idroom}))
        .map((doc: ReservationDoc)=>{
            return this.mapToReservation(doc)
        }
        )
    }

    async getById(reservationId: string): Promise<Reservation>{
        const model = await ReservationModel.findById(reservationId).populate('idRoom').exec()
        if (!model) throw new ModelNotFoundException()
        return this.mapToReservation(model)
    }

    async getByOwnerAndArtist(idOwner: string, idArtist: string): Promise<Array<Reservation>>{
        return (await ReservationModel.find({idUser: idArtist, idOwner: idOwner}))
        .map((doc: ReservationDoc)=>{
            return this.mapToReservation(doc)
        }
        )
    }

    async getByOwnerA(ownerId: string): Promise<Array<Reservation>>{
        return (await ReservationModel.find({
            //canceled: "false",
             idOwner: ownerId}).populate("idRoom").populate("idUser").exec())
        .map((doc: ReservationDoc)=>{
            return this.mapToReservation(doc)
        }
        )
    }
    async getByOwnerACanceled(ownerId: string): Promise<Array<Reservation>>{
        return (await ReservationModel.find({canceled: "true", idOwner: ownerId}).exec())
        .map((doc: ReservationDoc)=>{
            return this.mapToReservation(doc)
        }
        )
    }

    
    async getByUserCanceled(userId: string): Promise<Array<Reservation>>{
        return (await ReservationModel.find({canceled: "true", idUser: userId}).exec())
        .map((doc: ReservationDoc)=>{
            return this.mapToReservation(doc)
        }
        )
    }

    async getByRoom(roomId: string): Promise<Array<Reservation>>{
        return (await ReservationModel.find({canceled: "false", idRoom: roomId}).exec())
        .map((doc: ReservationDoc)=>{
            return this.mapToReservation(doc)
        }
        )
    }
    async getByRoomCanceled(roomId: string): Promise<Array<Reservation>>{
        return (await ReservationModel.find({canceled: "true", idRoom: roomId}).exec())
        .map((doc: ReservationDoc)=>{
            return this.mapToReservation(doc)
        }
        )
    }

    async findById(reservationId: String): Promise<Reservation> {
        const model = await ReservationModel.findById(reservationId).exec()
        if (!model) throw new ModelNotFoundException()
        return this.mapToReservation(model)
    }
   
    async create(reservation: CreateReservationDto): Promise<Reservation>{
        const updated = await ReservationModel.create({
            createdAt: reservation.createdAt,
            hsStart: reservation.hsStart,
            hsEnd: reservation.hsEnd,
            idOwner: reservation.idOwner,
            idUser: reservation.idUser,
            idRoom: reservation.idRoom,
            canceled: reservation.canceled,
            date: reservation.date,
            totalPrice: reservation.totalPrice
        })
        if (!updated) throw new ModelNotFoundException()
        return this.mapToReservation(updated)
    }

    async update(reservationId: string, reservation:CreateReservationDto): Promise<Reservation>{
        const updated = await ReservationModel.findByIdAndUpdate(reservationId,{
            createdAt: reservation.createdAt,
            hsStart: reservation.hsStart,
            hsEnd: reservation.hsEnd,
            idOwner: reservation.idOwner,
            idUser: reservation.idUser,
            idRoom: reservation.idRoom,
            canceled: reservation.canceled,
            date: reservation.date,
            totalPrice: reservation.totalPrice
        }).exec()
        if (!updated) throw new ModelNotFoundException()
        return this.mapToReservation(updated)
    }

    async cancel(reservationId: string, reservation: DeleteReservationDto): Promise<Reservation>{
        const updated = await ReservationModel.findByIdAndUpdate(reservationId,
            {hsStart: reservation.hsStart,
            hsEnd: reservation.hsEnd,
            idOwner: reservation.idOwner,
            idUser: reservation.idUser,
            idRoom: reservation.idRoom,
            canceled: "true",
            date: reservation.date,
            totalPrice: reservation.totalPrice,
            canceledDate: reservation.canceledDate
        }    
        ).exec()
        if (!updated) throw new ModelNotFoundException()
        return this.mapToReservation(updated)
    }

    async obtenerArtistasNuevosPorMes(fechaInicio: string, fechaFin: string): Promise<{ mes: string, cantidad: number }[]> {
        try {
            // Parsear fechas
            const fechaInicioObj = new Date(fechaInicio);
            const fechaFinObj = new Date(fechaFin);
            console.log("fecha Inicio", fechaInicioObj)
            console.log("fecha Fin", fechaFinObj)
            // Obtener la diferencia en meses
            const diffMeses = (fechaFinObj.getFullYear() - fechaInicioObj.getFullYear()) * 12 + fechaFinObj.getMonth() - fechaInicioObj.getMonth() + 1;

            // Inicializar el array de resultados
            const resultados: { año: number, mes: string, cantidad: number }[] = [];

            // Consultar la cantidad de documentos por mes
            for (let i = 0; i < diffMeses; i++) {
                const fechaActual = new Date(fechaInicioObj.getFullYear(), fechaInicioObj.getMonth() + i, 1);
                const fechaSiguiente = new Date(fechaInicioObj.getFullYear(), fechaInicioObj.getMonth() + i + 1, 1);

                const cantidad = await ReservationModel.countDocuments({
                    createdAt: {
                        $gte: fechaActual,
                        $lt: fechaSiguiente
                    },
                    userType:"artista"
                });
                const nombreDelMes = this.obtenerNombreDelMes(fechaActual.getMonth());
                resultados.push({ año: fechaActual.getFullYear(), mes: //fechaActual.getMonth() + 1
                    nombreDelMes
                    , cantidad });
            }
            
            console.log(resultados)
            return resultados;
        } catch (error) {
            console.error('Error al obtener la cantidad de documentos por mes:', error);
            throw error;
        }
    }
    // helper parsea
    obtenerNombreDelMes = (mes: number): string => {
        const nombresDeMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        return nombresDeMeses[mes];
    }


}

export const instance = new ReservationDao()