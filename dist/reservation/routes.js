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
exports.route = void 0;
const run_1 = require("../common/utils/run");
const middleware_1 = require("../server/middleware");
const service = __importStar(require("./service"));
const validator = __importStar(require("express-validator"));
const constants_1 = require("../common/utils/constants");
const validator_utils_1 = require("../common/utils/validator_utils");
const model_1 = require("./model");
var mongoose = require('mongoose');
const fs = require('fs-extra');
const generateReportePdf_1 = require("../common/utils/generateReportePdf");
const model_2 = require("../sala_de_ensayo/model");
const getStartAndEndOfWeek_1 = require("../common/utils/getStartAndEndOfWeek");
const route = (app) => {
    app.get("/reservations/", middleware_1.auth, (0, run_1.run)(async (req, res) => {
        const reservations = await service.instance.getAll();
        res.json(reservations);
    }));
    app.get("/reservation/findReservationbyId/", (0, run_1.run)(async (req, resp) => {
        const id = req.query.id;
        const reservation = await service.instance.getReservationById(id);
        resp.json(reservation);
    }));
    app.get("/reservations/findReservationByOwnerAndArtist", middleware_1.auth, (0, run_1.run)(async (req, res) => {
        const idArtist = req.query.idArtist;
        const idOwner = req.user.id;
        const reservations = await service.instance.getReservationByOwnerAndArtist(idOwner, idArtist);
        res.json(reservations);
    }));
    app.post("/reservation/create/", 
    //con auth, obtengo en req.use el usuairo logueado con req.user
    middleware_1.auth, validator.body("idRoom").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("idOwner").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), 
    //validator.body("idUser").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    validator.body("hsStart").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("hsEnd").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("date").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("totalPrice").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const dto = req.body;
        //idUser hace la reserva
        const idUser = req.user.id;
        const email = req.user.email;
        console.log('dto', dto);
        const reservation = await service.instance.createReservation({
            idRoom: dto['idRoom'],
            idOwner: dto['idOwner'],
            hsStart: dto['hsStart'],
            hsEnd: dto['hsEnd'],
            idUser: idUser,
            canceled: "false",
            date: dto["date"],
            totalPrice: dto["totalPrice"]
        }, email);
        resp.json(reservation);
    }));
    app.post("/reservation/update/", 
    //con auth, obtengo en req.use el usuairo logueado con req.user
    middleware_1.auth, validator.query("id").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const dto = req.body;
        const idUser = req.user.id;
        const email = req.user.email;
        const id = req.query.id;
        console.log('dto', dto);
        const reservationOriginal = await service.instance.getReservationById(id);
        if (!dto["idRoom"]) {
            dto["idRoom"] = reservationOriginal["idRoom"];
        }
        if (!dto["idOwner"]) {
            dto["idOwner"] = reservationOriginal["idOwner"];
        }
        if (!dto["idUser"]) {
            dto["idUser"] = reservationOriginal["idUser"];
        }
        if (!dto["hsStart"]) {
            dto["hsStart"] = reservationOriginal["hsStart"];
        }
        if (!dto["hsEnd"]) {
            dto["hsEnd"] = reservationOriginal["hsEnd"];
        }
        if (!dto["canceled"]) {
            dto["canceled"] = reservationOriginal["canceled"];
        }
        if (!dto["createdAt"]) {
            dto["createdAt"] = reservationOriginal["createdAt"];
        }
        if (!dto["deletedAt"]) {
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
            date: dto["date"],
            totalPrice: dto["totalPrice"]
        }, email);
        resp.json(reservation);
    }));
    //TODO endpointpara cancel reservation
    app.get("/reservation/cancel/", 
    //con auth, obtengo en req.use el usuairo logueado con req.user
    middleware_1.auth, validator.query("id").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const dto = req.body;
        const idUser = req.user.id;
        const email = req.user.email;
        const id = req.query.id;
        console.log('dto', dto);
        const reservationOriginal = await service.instance.getReservationById(id);
        if (!dto["idRoom"]) {
            dto["idRoom"] = reservationOriginal["idRoom"];
        }
        if (!dto["idOwner"]) {
            dto["idOwner"] = reservationOriginal["idOwner"];
        }
        if (!dto["idUser"]) {
            dto["idUser"] = reservationOriginal["idUser"];
        }
        if (!dto["hsStart"]) {
            dto["hsStart"] = reservationOriginal["hsStart"];
        }
        if (!dto["hsEnd"]) {
            dto["hsEnd"] = reservationOriginal["hsEnd"];
        }
        if (!dto["canceled"]) {
            dto["canceled"] = reservationOriginal["canceled"];
        }
        if (!dto["createdAt"]) {
            dto["createdAt"] = reservationOriginal["createdAt"];
        }
        if (!dto["deletedAt"]) {
            dto["deletedAt"] = reservationOriginal["deletedAt"];
        }
        if (!dto["date"]) {
            dto["date"] = reservationOriginal["date"];
        }
        if (!dto["totalPrice"]) {
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
            date: dto["date"],
            totalPrice: dto["totalPrice"]
        }, email);
        resp.json(reservation);
    }));
    app.get("/reservation/findReservationbyOwner/", middleware_1.auth, (0, run_1.run)(async (req, resp) => {
        const id = req.user.id;
        const reservation = await service.instance.getReservationByOwner(id);
        resp.json(reservation);
    }));
    app.get("/reservation/findReservationbyOwnerCanceled/", (0, run_1.run)(async (req, resp) => {
        const id = req.query.id;
        const reservation = await service.instance.getReservationByOwnerCanceled(id);
        resp.json(reservation);
    }));
    app.get("/reservation/findReservationbyUser/", (0, run_1.run)(async (req, resp) => {
        const id = req.query.id;
        const reservation = await service.instance.getReservationByUser(id);
        resp.json(reservation);
    }));
    //idUser hace la reserva
    app.get("/reservation/findReservationbyUserAndRoom/:userId/:roomId", middleware_1.auth, (0, run_1.run)(async (req, resp) => {
        const id = req.params.userId;
        //Probar una vez mas con este roomId en la query
        const roomId = req.params.roomId;
        // const dto = req.body
        // const idRoom = dto["idRoom"]
        console.log('ruta get opinion by user', id + ' and sala, idRoom: ', roomId);
        const reservation = await service.instance.getReservationByUserAndRoom(id, roomId);
        console.log('ruta reservation: ', reservation);
        resp.json(reservation);
    }));
    app.get("/reservation/findReservationbyUserCanceled/", (0, run_1.run)(async (req, resp) => {
        const id = req.query.id;
        const reservation = await service.instance.getReservationByUserCanceled(id);
        resp.json(reservation);
    }));
    app.get("/reservation/findReservationbyRoom/", (0, run_1.run)(async (req, resp) => {
        const id = req.query.id;
        console.log('back get room reservations');
        const reservation = await service.instance.getReservationByRoom(id);
        console.log('back room reservation response: ', reservation);
        resp.json(reservation);
    }));
    app.get("/reservation/findReservationbyRoomCanceled/", (0, run_1.run)(async (req, resp) => {
        const id = req.query.id;
        const reservation = await service.instance.getReservationByRoomCanceled(id);
        resp.json(reservation);
    }));
    app.post("/reservations/reservationsPorSalaMes/", middleware_1.auth, validator.body("fechaI").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("fechaH").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("idRoom").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const idUser = req.user.id;
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const dto = req.body;
        console.log('dto sala, fechas I y H: ', dto);
        //fechaID = 'YYYY-MM-DD'
        console.log("ruta reporte reservas por mes");
        console.log(dto.fechaI);
        console.log(dto.fechaH);
        console.log(dto.idRoom);
        let dtoNewUsersReport = [];
        //falta pasar parametro idRoom
        const NewUsersReport = await service.instance.getReservasPorMes(dto.idRoom, dto.fechaI, dto.fechaH);
        console.log(NewUsersReport);
        resp.json(NewUsersReport);
    }));
    //descargar reporte reservas por mes
    app.post("/reservations/descargarReporteReservationsPorSalaMes/", middleware_1.auth, validator.body("fechaI").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("fechaH").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("idRoom").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        try {
            console.log('Endpoint descargar reporte reservas por mes');
            const idUser = req.user.id;
            const errors = validator.validationResult(req);
            if (errors && !errors.isEmpty()) {
                throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
            }
            const dto = req.body;
            let dtoNewUsersReport = [];
            const NewUsersReport = await service.instance.getReservasPorMes(dto.idRoom, dto.fechaI, dto.fechaH);
            //console.log(NewUsersReport)
            //obtener sala de ensayo para tener su nombre:
            const salaId = mongoose.Types.ObjectId(dto.idRoom);
            const sala = await model_2.SalaDeEnsayoModel.findById(salaId);
            if (!sala) {
                throw new Error("Sala de ensayo no encontrada");
            }
            const salaNombre = sala.nameSalaEnsayo;
            const fechaInicio = dto.fechaI;
            const fechaHasta = dto.fechaH;
            //Codigo Javascript :
            const chartImage = await (0, generateReportePdf_1.generateReporteBarChart)(NewUsersReport.labels, NewUsersReport.datasets[0].data, 'Cantidad de reservas'); // Generar el gráfico de barras
            //const chartImageBasic = await generateBarChart(mesesString, arrCantidades); // Generar el gráfico de barras
            const pdfBytes = await (0, generateReportePdf_1.generateReporteValoracionesPDF)(chartImage, 'Reporte - Cantidad de Reservas', salaNombre, fechaInicio, fechaHasta); // Generar el PDF con el gráfico
            if (!pdfBytes || pdfBytes.length === 0) {
                throw new Error("El PDF no se generó o está vacío.");
            }
            const currentDate = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '_');
            const fileName = `reporte_reservas_${currentDate}.pdf`;
            resp.setHeader('Content-Type', 'application/pdf');
            resp.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            resp.setHeader('Content-Length', pdfBytes.length);
            resp.end(Buffer.from(pdfBytes));
        }
        catch (error) {
            console.error('Error in PDF generation route:', error);
            resp.status(500).send({ error: 'Failed to generate PDF' });
        }
    }));
    //TODO: revisar
    app.post("/reservations/reservationsCanceladasPorSalaMes/", middleware_1.auth, validator.body("fechaI").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("fechaH").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("idRoom").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const idUser = req.user.id;
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const dto = req.body;
        console.log('dto fechas I y H: ', dto);
        //fechaID = 'YYYY-MM-DD'
        console.log("ruta reporte reservas por mes");
        console.log(dto.fechaI);
        console.log(dto.fechaH);
        // const users : UserDto[] = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
        let dtoNewUsersReport = [];
        //dias = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
        //const NewUsersReport = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
        const NewUsersReport = await service.instance.getReservasCanceladasPorMes(dto.idRoom, idUser, dto.fechaI, dto.fechaH);
        console.log(NewUsersReport);
        resp.json(NewUsersReport);
    }));
    //descargar cantidad reservas canceladas sala
    app.post("/reservations/descargarReservationsCanceladasPorSalaMes/", middleware_1.auth, validator.body("fechaI").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("fechaH").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("idRoom").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        try {
            const idUser = req.user.id;
            const errors = validator.validationResult(req);
            if (errors && !errors.isEmpty()) {
                throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
            }
            const dto = req.body;
            console.log('dto fechas I y H: ', dto);
            //fechaID = 'YYYY-MM-DD'
            console.log("ruta reporte reservas por mes");
            console.log(dto.fechaI);
            console.log(dto.fechaH);
            // const users : UserDto[] = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            let dtoNewUsersReport = [];
            //dias = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            //const NewUsersReport = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            const NewUsersReport = await service.instance.getReservasCanceladasPorMes(dto.idRoom, idUser, dto.fechaI, dto.fechaH);
            console.log(NewUsersReport);
            //crear imagen, pdf y descargar
            //obtener sala de ensayo para tener su nombre:
            const salaId = mongoose.Types.ObjectId(dto.idRoom);
            const sala = await model_2.SalaDeEnsayoModel.findById(salaId);
            if (!sala) {
                throw new Error("Sala de ensayo no encontrada");
            }
            const salaNombre = sala.nameSalaEnsayo;
            const fechaInicio = dto.fechaI;
            const fechaHasta = dto.fechaH;
            //Codigo Javascript :
            const chartImage = await (0, generateReportePdf_1.generateReporteBarChart)(NewUsersReport.labels, NewUsersReport.datasets[0].data, 'Cancelaciones de Reservas'); // Generar el gráfico de barras
            //const chartImageBasic = await generateBarChart(mesesString, arrCantidades); // Generar el gráfico de barras
            const pdfBytes = await (0, generateReportePdf_1.generateReporteValoracionesPDF)(chartImage, 'Reporte - Cancelaciones de Reservas', salaNombre, fechaInicio, fechaHasta); // Generar el PDF con el gráfico
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
        }
        catch (error) {
            console.error('Error in PDF generation route:', error);
            resp.status(500).send({ error: 'Failed to generate PDF' });
        }
    }));
    //endpoint para  contar la cantidad de reserva por dia de semana por sala
    app.get("/reservations/cantidadReservasPorDia/", middleware_1.auth, validator.query("idRoom").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, res) => {
        const idRoom = req.query.idRoom;
        const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
        const reservations = await model_1.ReservationModel.aggregate([
            {
                $match: {
                    idRoom: new mongoose.Types.ObjectId(idRoom),
                },
            },
            {
                $group: {
                    _id: { $dayOfWeek: "$date" },
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
        };
        console.log('response dia mas valorado: ', response);
        res.json(response);
    }));
    //descargar reporte dia mas reservado/valorado
    app.get("/reservations/descargarReporteCantidadReservasPorDia/", middleware_1.auth, validator.query("idRoom").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, res) => {
        try {
            const idRoom = req.query.idRoom;
            const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
            const reservations = await model_1.ReservationModel.aggregate([
                {
                    $match: {
                        idRoom: new mongoose.Types.ObjectId(idRoom),
                    },
                },
                {
                    $group: {
                        _id: { $dayOfWeek: "$date" },
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
            };
            console.log('response dia mas valorado: ', response);
            //obtener sala de ensayo para tener su nombre:
            //const idRoom = req.query.idRoom as string
            const salaId = mongoose.Types.ObjectId(idRoom);
            const sala = await model_2.SalaDeEnsayoModel.findById(salaId);
            if (!sala) {
                throw new Error("Sala de ensayo no encontrada");
            }
            const salaNombre = sala.nameSalaEnsayo;
            // const fechaInicio =  dto.fechaI
            // const fechaHasta =  dto.fechaH
            //Codigo Javascript :
            const chartImage = await (0, generateReportePdf_1.generateReporteBarChart)(response.labels, response.datasets[0].data, 'Reservas por dia'); // Generar el gráfico de barras
            //const chartImageBasic = await generateBarChart(mesesString, arrCantidades); // Generar el gráfico de barras
            const pdfBytes = await (0, generateReportePdf_1.generateReporteValoracionesPDF)(chartImage, 'Reporte - Reservas por dia', salaNombre); // Generar el PDF con el gráfico
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
        }
        catch (error) {
            console.error('Error in PDF generation route:', error);
            res.status(500).send({ error: 'Failed to generate PDF' });
        }
    }));
    //TODO  probar
    app.get("/reservations/gananciasSemana/", middleware_1.auth, (0, run_1.run)(async (req, res) => {
        const idUser = req.user.id;
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const hoy = new Date();
        // const {startOfWeek, endOfWeek } = getStartAndEndOfWeek(dto.fechaI ? new Date(dto.fechaI) : new Date());
        const { startOfWeek, endOfWeek } = (0, getStartAndEndOfWeek_1.getStartAndEndOfWeek)(hoy);
        const reservas = await model_1.ReservationModel.find({
            createdAt: {
                $gte: startOfWeek,
                $lte: endOfWeek,
            },
        });
        const total = reservas.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
        console.log('startOfWeek, endOfWeek, reservas, total: ', startOfWeek, endOfWeek, reservas, total);
        res.json({
            status: "success",
            ganancias: total
        });
    }));
    app.get("/reservations/reservasSemana/", middleware_1.auth, (0, run_1.run)(async (req, res) => {
        const idUser = req.user.id;
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const hoy = new Date();
        // const {startOfWeek, endOfWeek } = getStartAndEndOfWeek(dto.fechaI ? new Date(dto.fechaI) : new Date());
        const { startOfWeek, endOfWeek } = (0, getStartAndEndOfWeek_1.getStartAndEndOfWeek)(hoy);
        const reservas = await model_1.ReservationModel.find({
            createdAt: {
                $gte: startOfWeek,
                $lte: endOfWeek,
            },
        }).populate("idUser").populate("idRoom");
        const total = reservas.length;
        console.log('startOfWeek, endOfWeek, reservas, total: ', startOfWeek, endOfWeek, reservas, total);
        res.json({
            status: "success",
            totalReservas: total,
            reservas: reservas
        });
    }));
};
exports.route = route;
