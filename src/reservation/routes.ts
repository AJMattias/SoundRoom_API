import { Application, Request, Response } from "express";
import { run } from "../common/utils/run";
import { admin, auth } from "../server/middleware";
import * as service from "./service"
import { ReservationDto, ReservationHsDto } from "./dto";
import * as validator from "express-validator"
import {ErrorCode} from "../common/utils/constants"
import { ValidatorUtils } from "../common/utils/validator_utils";
import { ReservationModel } from "./model";
var mongoose = require('mongoose');
const fs = require('fs-extra');
import { generateBarChartExample, generatePDF, generateBarChart  } from '../common/utils/generatePdf'
import { generateReporteBarChartExample, generateReportePDF, generateReporteBarChart, generateReporteValoracionesPDF  } from '../common/utils/generateReportePdf'
import { SalaDeEnsayoModel } from "../sala_de_ensayo/model";
import { getStartAndEndOfWeek } from "../common/utils/getStartAndEndOfWeek";


export const route = (app: Application) =>{
 
    app.get("/reservations/",
        auth,
        run( async(req: any, res: Response)=>{
            const reservations: ReservationDto[] = await service.instance.getAll()
            res.json(reservations)
    }))

    app.get("/reservationsDateHs/",
        auth,
        run( async(req: any, res: Response)=>{
            const idRoom = req.query.idRoom as string
            const date = req.query.date
            const reservations: ReservationHsDto[] = await service.instance.getByRoomyDate(idRoom, date)
            res.json(reservations)
    }))

    app.get("/reservation/findReservationbyId/",
        run(async (req: Request,resp: Response) => {
        const id = req.query.id as string
        const reservation : ReservationDto = await  service.instance.getReservationById(id)
        resp.json(reservation) 
     }))

     app.get("/reservations/findReservationByOwnerAndArtist",
        auth,
        run( async(req: any, res: Response)=>{
            const idArtist = req.query.idArtist as string
            const idOwner = req.user.id as string
            const reservations: ReservationDto[] = await service.instance.getReservationByOwnerAndArtist(idOwner, idArtist)
            res.json(reservations)
    }))

    app.post("/reservation/create/",
        //con auth, obtengo en req.use el usuairo logueado con req.user
        auth,
        validator.body("idRoom").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("idOwner").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED), 
        //validator.body("idUser").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("hsStart").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("hsEnd").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("date").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("totalPrice").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        run(async( req: any, resp: Response)=>{
            const errors = validator.validationResult(req)
                    if(errors && !errors.isEmpty()){
                        throw ValidatorUtils.toArgumentsException(errors.array())
                    }
            const dto = req.body
            //idUser hace la reserva
            const idUser = req.user.id
            const email = req.user.email
            console.log('dto', dto)
            const reservation = await service.instance.createReservation({
                idRoom: dto['idRoom'],
                idOwner: dto['idOwner'],
                hsStart: dto['hsStart'],
                hsEnd: dto['hsEnd'],
                idUser: idUser,
                canceled: "false",
                date:dto["date"],
                totalPrice: dto["totalPrice"]
            }, email)

            resp.json(reservation)
        })
    )

    app.post("/reservation/update/",
        //con auth, obtengo en req.use el usuairo logueado con req.user
        auth,
        validator.query("id").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        run(async( req: any, resp: Response)=>{
            const errors = validator.validationResult(req)
                    if(errors && !errors.isEmpty()){
                        throw ValidatorUtils.toArgumentsException(errors.array())
                    }
            const dto = req.body
            const idUser = req.user.id
            const email = req.user.email
            const id = req.query.id as string
            console.log('dto', dto)
            const reservationOriginal : ReservationDto = await service.instance.getReservationById(id)
            if(!dto["idRoom"]){
                dto["idRoom"] = reservationOriginal["idRoom"];
            }
            if(!dto["idOwner"]){
                dto["idOwner"] = reservationOriginal["idOwner"];
            }
            if(!dto["idUser"]){
                dto["idUser"] = reservationOriginal["idUser"];
            }
            if(!dto["hsStart"]){
                dto["hsStart"] = reservationOriginal["hsStart"];
            }
            if(!dto["hsEnd"]){
                dto["hsEnd"] = reservationOriginal["hsEnd"];
            }
            if(!dto["canceled"]){
                dto["canceled"] = reservationOriginal["canceled"];
            }
            if(!dto["createdAt"]){
                dto["createdAt"] = reservationOriginal["createdAt"];
            }
            if(!dto["deletedAt"]){
                dto["deletedAt"] = reservationOriginal["deletedAt"];
            }
            const reservation = await service.instance.createReservation({
                createdAt: dto["createdAt"],
                deletedAt: dto["deletedAt"],
                idRoom: dto['idRoom'],
                idOwner: dto['idOwner'],
                hsStart: dto['hsStart'],
                hsEnd: dto['hsEnd'],
                idUser: idUser,
                canceled: "false",
                date:dto["date"],
                totalPrice: dto["totalPrice"]
            }, email)

            resp.json(reservation)
        })
    )

    //TODO endpointpara cancel reservation

    app.get("/reservation/cancel/",
        //con auth, obtengo en req.use el usuairo logueado con req.user
        auth,
        validator.query("id").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        run(async( req: any, resp: Response)=>{
            const errors = validator.validationResult(req)
                    if(errors && !errors.isEmpty()){
                        throw ValidatorUtils.toArgumentsException(errors.array())
                    }
            const dto = req.body
            const idUser = req.user.id
            const email = req.user.email
            const id = req.query.id as string
            console.log('dto', dto)
            const reservationOriginal : ReservationDto = await service.instance.getReservationById(id)
            if(!dto["idRoom"]){
                dto["idRoom"] = reservationOriginal["idRoom"];
            }
            if(!dto["idOwner"]){
                dto["idOwner"] = reservationOriginal["idOwner"];
            }
            if(!dto["idUser"]){
                dto["idUser"] = reservationOriginal["idUser"];
            }
            if(!dto["hsStart"]){
                dto["hsStart"] = reservationOriginal["hsStart"];
            }
            if(!dto["hsEnd"]){
                dto["hsEnd"] = reservationOriginal["hsEnd"];
            }
            if(!dto["canceled"]){
                dto["canceled"] = reservationOriginal["canceled"];
            }
            if(!dto["createdAt"]){
                dto["createdAt"] = reservationOriginal["createdAt"];
            }
            if(!dto["deletedAt"]){
                dto["deletedAt"] = reservationOriginal["deletedAt"];
            }
            if(!dto["date"]){
                dto["date"] = reservationOriginal["date"];
            }
            if(!dto["totalPrice"]){
                dto["totalPrice"] = reservationOriginal["totalPrice"];
            }
            const reservation = await service.instance.cancelReservation(id, {
                createdAt: dto["createdAt"],
                deletedAt: dto["deletedAt"],
                idRoom: dto['idRoom'],
                idOwner: dto['idOwner'],
                hsStart: dto['hsStart'],
                hsEnd: dto['hsEnd'],
                idUser: idUser,
                canceled: "true",
                date:dto["date"],
                totalPrice: dto["totalPrice"]
            }, email)

            resp.json(reservation)
        })
    )

    app.get("/reservation/findReservationbyOwner/", 
        auth, 
        run(async (req: any ,resp: Response) => {
        const id = req.user.id as string
        const reservation : ReservationDto[] = await  service.instance.getReservationByOwner(id)
        resp.json(reservation) 
    }))

    app.get("/reservation/findReservationbyOwnerCanceled/",
        run(async (req: Request,resp: Response) => {
        const id = req.query.id as string
        const reservation : ReservationDto[] = await  service.instance.getReservationByOwnerCanceled(id)
        resp.json(reservation) 
    }))

    app.get("/reservation/findReservationbyUser/",
        auth,
        run(async (req: any,resp: Response) => {
        const id = req.user.id as string
        const reservation : ReservationDto[] = await  service.instance.getReservationByUser(id)
        resp.json(reservation) 
    }))

    //idUser hace la reserva
    app.get("/reservation/findReservationbyUserAndRoom/:userId/:roomId",
        auth,
        run(async (req: Request,resp: Response) => {
        const id = req.params.userId as string
        //Probar una vez mas con este roomId en la query
        const roomId = req.params.roomId as string;
        // const dto = req.body
        // const idRoom = dto["idRoom"]
        console.log('ruta get opinion by user', id + ' and sala, idRoom: ', roomId)
        const reservation : ReservationDto[] = await  service.instance.getReservationByUserAndRoom(id, roomId)
        console.log('ruta reservation: ', reservation)
        resp.json(reservation) 
    }))

     //idUser hace la reserva
    app.get("/reservation/findReservationbyUserAndOwner/:userId/:ownerId",
        auth,
        run(async (req: Request,resp: Response) => {
        const id = req.params.userId as string
        //Probar una vez mas con este roomId en la query
        const ownerId = req.params.ownerId as string;
        // const dto = req.body
        // const idRoom = dto["idRoom"]
        console.log('ruta get opinion by user', id + ' and sala, idRoom: ', ownerId)
        const reservation : ReservationDto[] = await  service.instance.getReservationByUserAndOwner(id, ownerId)
        console.log('ruta reservation: ', reservation)
        resp.json(reservation) 
    }))

    app.get("/reservation/findReservationbyUserCanceled/",
        run(async (req: Request,resp: Response) => {
        const id = req.query.id as string
        const reservation : ReservationDto[] = await  service.instance.getReservationByUserCanceled(id)
        resp.json(reservation) 
    }))

    app.get("/reservation/findReservationbyRoom/",
        run(async (req: Request,resp: Response) => {
        const id = req.query.id as string
        console.log('back get room reservations')
        const reservation : ReservationDto[] = await  service.instance.getReservationByRoom(id)
        console.log('back room reservation response: ', reservation)
        resp.json(reservation) 
    }))

    app.get("/reservation/findReservationbyRoomCanceled/",
        run(async (req: Request,resp: Response) => {
        const id = req.query.id as string
        const reservation : ReservationDto[] = await  service.instance.getReservationByRoomCanceled(id)
        resp.json(reservation) 
    }))

    app.post("/reservations/reservationsPorSalaMes/", 
        auth,
        validator.body("fechaI").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("fechaH").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),        
        validator.body("idRoom").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),        
        run(async (req: any, resp: Response) => {
            const idUser = req.user.id
            const errors = validator.validationResult(req)
            if(errors && !errors.isEmpty()){
                throw ValidatorUtils.toArgumentsException(errors.array())
            }
            const dto = req.body 
            console.log('dto sala, fechas I y H: ', dto)
            //fechaID = 'YYYY-MM-DD'
            console.log("ruta reporte reservas por mes")
            console.log(dto.fechaI)
            console.log(dto.fechaH)
            console.log(dto.idRoom)
            let dtoNewUsersReport = [] 
            //falta pasar parametro idRoom
            const NewUsersReport = await  service.instance.getReservasPorMes(dto.idRoom, dto.fechaI, dto.fechaH)
            console.log(NewUsersReport)
            resp.json(NewUsersReport)    
    }))

    //descargar reporte reservas por mes
    app.post("/reservations/descargarReporteReservationsPorSalaMes/", 
        auth,
        validator.body("fechaI").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("fechaH").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),        
        validator.body("idRoom").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),        
        run(async (req: any, resp: Response) => {
            try {   
            
            console.log('Endpoint descargar reporte reservas por mes')
            const idUser = req.user.id
            const errors = validator.validationResult(req)
            if(errors && !errors.isEmpty()){
                throw ValidatorUtils.toArgumentsException(errors.array())
            }
            const dto = req.body 
            
            let dtoNewUsersReport = [] 
            
            const NewUsersReport = await  service.instance.getReservasPorMes(dto.idRoom, dto.fechaI, dto.fechaH)
            //console.log(NewUsersReport)
            
            //obtener sala de ensayo para tener su nombre:
            const salaId = mongoose.Types.ObjectId(dto.idRoom)
            const sala = await SalaDeEnsayoModel.findById(salaId)
            if (!sala) {
                throw new Error("Sala de ensayo no encontrada");
            }
            const salaNombre= sala.nameSalaEnsayo 

            const fechaInicio =  dto.fechaI
            const fechaHasta =  dto.fechaH

            //Codigo Javascript :
            const chartImage = await generateReporteBarChart(
                NewUsersReport.labels, 
                NewUsersReport.datasets[0].data,
                'Cantidad de reservas'); // Generar el gráfico de barras
            //const chartImageBasic = await generateBarChart(mesesString, arrCantidades); // Generar el gráfico de barras
            const pdfBytes = await generateReporteValoracionesPDF(
                chartImage, 'Reporte - Cantidad de Reservas',
                salaNombre,  fechaInicio, fechaHasta ); // Generar el PDF con el gráfico
            if (!pdfBytes || pdfBytes.length === 0) {
                throw new Error("El PDF no se generó o está vacío.");
            }

            const currentDate = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '_');
            
            const fileName = `reporte_reservas_${currentDate}.pdf`;
            resp.setHeader('Content-Type', 'application/pdf');
            resp.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            resp.setHeader('Content-Length', pdfBytes.length);
            
            resp.end(Buffer.from(pdfBytes));    
        } catch (error) {
            console.error('Error in PDF generation route:', error);
            resp.status(500).send({ error: 'Failed to generate PDF' }); 
        }

    }))
    
//TODO: revisar
    app.post("/reservations/reservationsCanceladasPorSalaMes/", 
        auth,
        validator.body("fechaI").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("fechaH").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),        
        validator.body("idRoom").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),        
        run(async (req: any, resp: Response) => {
            const idUser = req.user.id
            const errors = validator.validationResult(req)
            if(errors && !errors.isEmpty()){
                throw ValidatorUtils.toArgumentsException(errors.array())
            }
            const dto = req.body 
            console.log('dto fechas I y H: ', dto)
            //fechaID = 'YYYY-MM-DD'
            console.log("ruta reporte reservas por mes")
            console.log(dto.fechaI)
            console.log(dto.fechaH)
            // const users : UserDto[] = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            let dtoNewUsersReport = [] 
            //dias = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            //const NewUsersReport = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            const NewUsersReport = await  service.instance.getReservasCanceladasPorMes(dto.idRoom, idUser, dto.fechaI, dto.fechaH)
            console.log(NewUsersReport)
            resp.json(NewUsersReport)    
    }))

    //descargar cantidad reservas canceladas sala
    app.post("/reservations/descargarReservationsCanceladasPorSalaMes/", 
        auth,
        validator.body("fechaI").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("fechaH").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),        
        validator.body("idRoom").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),        
        run(async (req: any, resp: Response) => {
        try {
            const idUser = req.user.id
            const errors = validator.validationResult(req)
            if(errors && !errors.isEmpty()){
                throw ValidatorUtils.toArgumentsException(errors.array())
            }
            const dto = req.body 
            console.log('dto fechas I y H: ', dto)
            //fechaID = 'YYYY-MM-DD'
            console.log("ruta reporte reservas por mes")
            console.log(dto.fechaI)
            console.log(dto.fechaH)
            // const users : UserDto[] = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            let dtoNewUsersReport = [] 
            //dias = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            //const NewUsersReport = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            const NewUsersReport = await  service.instance.getReservasCanceladasPorMes(dto.idRoom, idUser, dto.fechaI, dto.fechaH)
            console.log(NewUsersReport)
            
            //crear imagen, pdf y descargar
            //obtener sala de ensayo para tener su nombre:
            const salaId = mongoose.Types.ObjectId(dto.idRoom)
            const sala = await SalaDeEnsayoModel.findById(salaId)
            if (!sala) {
                throw new Error("Sala de ensayo no encontrada");
            }
            const salaNombre= sala.nameSalaEnsayo 

            const fechaInicio =  dto.fechaI
            const fechaHasta =  dto.fechaH

            //Codigo Javascript :
            const chartImage = await generateReporteBarChart(NewUsersReport.labels, NewUsersReport.datasets[0].data, 'Cancelaciones de Reservas'); // Generar el gráfico de barras
            //const chartImageBasic = await generateBarChart(mesesString, arrCantidades); // Generar el gráfico de barras
            const pdfBytes = await generateReporteValoracionesPDF(chartImage, 'Reporte - Cancelaciones de Reservas', salaNombre,  fechaInicio, fechaHasta ); // Generar el PDF con el gráfico
            if (!pdfBytes || pdfBytes.length === 0) {
                throw new Error("El PDF no se generó o está vacío.");
            }
            // crear nombre de archivo irrepetible
            const currentDate = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '_');

            // Enviar el archivo al cliente
            const fileName = `reporte_reservas_canceladas_${currentDate}.pdf`;
            resp.setHeader('Content-Type', 'application/pdf');
            resp.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            resp.setHeader('Content-Length', pdfBytes.length);
            resp.end(Buffer.from(pdfBytes));
        } catch (error) {
            console.error('Error in PDF generation route:', error);
            resp.status(500).send({ error: 'Failed to generate PDF' }); 
        }
    }))

    //endpoint para  contar la cantidad de reserva por dia de semana por sala
    app.get("/reservations/cantidadReservasPorDia/", 
        auth, 
        validator.query("idRoom").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        run (async (req: any, res: Response)=>{
            const idRoom = req.query.idRoom as string
            const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

                const reservations = await ReservationModel.aggregate([
                {
                    $match: {
                        idRoom: new mongoose.Types.ObjectId(idRoom),
                    },
                },
                {
                    $group: {
                        _id: { $dayOfWeek: "$date" }, // Agrupa por día de la semana
                        count: { $sum: 1 },
                    },
                },
                {
                    $sort: { "_id": 1 }, // Ordena por día de la semana (1 = Domingo, 7 = Sábado)
                },
            ]);

            // Mapea los resultados a los días de la semana y asegura que cada día tenga un conteo, incluso si es 0
            const data = daysOfWeek.map((day, index) => {
                const reservation = reservations.find(res => res._id === (index + 1));
                return reservation ? reservation.count : 0;
            });
            let response = {
            labels: daysOfWeek,
            datasets: [
                {
                    data,
                },
            ],
            }
            console.log('response dia mas valorado: ', response)
            res.json(response)
        })
    )


    //descargar reporte dia mas reservado/valorado
    app.get("/reservations/descargarReporteCantidadReservasPorDia/", 
        auth, 
        validator.query("idRoom").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        run (async (req: any, res: Response)=>{
           try {
             const idRoom = req.query.idRoom as string
            const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

                const reservations = await ReservationModel.aggregate([
                {
                    $match: {
                        idRoom: new mongoose.Types.ObjectId(idRoom),
                    },
                },
                {
                    $group: {
                        _id: { $dayOfWeek: "$date" }, // Agrupa por día de la semana
                        count: { $sum: 1 },
                    },
                },
                {
                    $sort: { "_id": 1 }, // Ordena por día de la semana (1 = Domingo, 7 = Sábado)
                },
            ]);

            // Mapea los resultados a los días de la semana y asegura que cada día tenga un conteo, incluso si es 0
            const data = daysOfWeek.map((day, index) => {
                const reservation = reservations.find(res => res._id === (index + 1));
                return reservation ? reservation.count : 0;
            });
            let response = {
            labels: daysOfWeek,
            datasets: [
                {
                    data,
                },
            ],
            }
            console.log('response dia mas valorado: ', response)
            
            //obtener sala de ensayo para tener su nombre:
            //const idRoom = req.query.idRoom as string
            const salaId = mongoose.Types.ObjectId(idRoom)
            const sala = await SalaDeEnsayoModel.findById(salaId)
            if (!sala) {
                throw new Error("Sala de ensayo no encontrada");
            }
            const salaNombre= sala.nameSalaEnsayo 

            // const fechaInicio =  dto.fechaI
            // const fechaHasta =  dto.fechaH

            //Codigo Javascript :
            const chartImage = await generateReporteBarChart(response.labels, response.datasets[0].data, 'Reservas por dia'); // Generar el gráfico de barras
            //const chartImageBasic = await generateBarChart(mesesString, arrCantidades); // Generar el gráfico de barras
            const pdfBytes = await generateReporteValoracionesPDF(chartImage, 'Reporte - Reservas por dia', salaNombre ); // Generar el PDF con el gráfico
            if (!pdfBytes || pdfBytes.length === 0) {
                throw new Error("El PDF no se generó o está vacío.");
            }
            // crear nombre de archivo irrepetible
            const currentDate = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '_');

            
            // Enviar el archivo al cliente
            const fileName = `reporte_reservas_${currentDate}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.setHeader('Content-Length', pdfBytes.length);
            res.end(Buffer.from(pdfBytes));
           } catch (error) {
                console.error('Error in PDF generation route:', error);
                res.status(500).send({ error: 'Failed to generate PDF' }); 
           }  
        })
    )

    //TODO  probar
    app.get("/reservations/gananciasSemana/", 
        auth,
        run (async (req: any, res: Response)=>{
            const idUser = req.user.id
            const errors = validator.validationResult(req)
            if(errors && !errors.isEmpty()){
                throw ValidatorUtils.toArgumentsException(errors.array())
            }
            const hoy = new Date()

            // const {startOfWeek, endOfWeek } = getStartAndEndOfWeek(dto.fechaI ? new Date(dto.fechaI) : new Date());
            const {startOfWeek, endOfWeek } = getStartAndEndOfWeek(hoy);

            const reservas = await ReservationModel.find({
                createdAt: {
                $gte: startOfWeek,
                $lte: endOfWeek,
                },
            })

            const total = reservas.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
            console.log('startOfWeek, endOfWeek, reservas, total: ', startOfWeek, endOfWeek, reservas, total)
            res.json({
                status: "success",
                ganancias: total
            })
        }
    ))   

    app.get("/reservations/reservasSemana/", 
        auth,
        run (async (req: any, res: Response)=>{
            const idUser = req.user.id
            const errors = validator.validationResult(req)
            if(errors && !errors.isEmpty()){
                throw ValidatorUtils.toArgumentsException(errors.array())
            }
            const hoy = new Date()

            // const {startOfWeek, endOfWeek } = getStartAndEndOfWeek(dto.fechaI ? new Date(dto.fechaI) : new Date());
            const {startOfWeek, endOfWeek } = getStartAndEndOfWeek(hoy);

            const reservas = await ReservationModel.find({
                createdAt: {
                $gte: startOfWeek,
                $lte: endOfWeek,
                },
            }).populate("idUser").populate("idRoom")

            const total = reservas.length;
            console.log('startOfWeek, endOfWeek, reservas, total: ', startOfWeek, endOfWeek, reservas, total)
            res.json({
                status: "success",
                totalReservas: total,
                reservas: reservas
            })
        }
    )) 


}