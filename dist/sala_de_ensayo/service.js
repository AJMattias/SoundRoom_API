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
exports.instance = exports.SalaService = void 0;
const dao = __importStar(require("./dao"));
const model_1 = require("./model");
var mongoose = require('mongoose');
class SalaService {
    constructor(salaDeEnsayoDao) {
        this.obtenerNombreDelMes = (mes) => {
            const nombresDeMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
            return nombresDeMeses[mes];
        };
        this.dao = salaDeEnsayoDao;
    }
    async findByName(nombre) {
        const salas = await this.dao.findByName(nombre);
        return salas.map((sala) => {
            return this.mapToDto(sala);
        });
    }
    /*

    async findByName(nombre: string): Promise<Array<SalaDeEnsayoDto>>{
        const salas = await this.findByName(nombre)
        return salas.map((sala: SalaDeEnsayo) =>{
            return this.mapToDto(sala)
        })
    }
    */
    async createSalaDeEnsayo(dto) {
        console.log("servicio idImagen: ", dto.imagenes);
        console.log("service sde e imagen ", dto);
        if (dto.enabled === undefined) {
            console.log('back service, create sala dto.enabled: ', dto.enabled);
            dto.enabled = 'habilitado';
        }
        return this.mapToDto(await this.dao.store({
            nameSalaEnsayo: dto.nameSalaEnsayo,
            calleDireccion: dto.calleDireccion,
            //idImagen?: dto.idImagen? dto.idImagen : undefined,
            idType: dto.idType,
            idOwner: dto.idOwner,
            precioHora: dto.precioHora,
            duracionTurno: dto.duracionTurno,
            createdAt: new Date(),
            enabled: dto.enabled,
            descripcion: dto.descripcion,
            comodidades: dto.comodidades,
            imagenes: dto.imagenes ?? [],
            horarios: dto.horarios ?? [],
        }));
    }
    async getAll() {
        const salas = await this.dao.getAll();
        return salas.map((sala) => {
            return this.mapToDto(sala);
        });
    }
    async getPopulars() {
        const salas = await this.dao.getPopulars();
        return salas.map((sala) => {
            return this.mapToDto(sala);
        });
        // const salas2 = salas.map((sala: SalaDeEnsayo) =>{
        // return this.mapToDto(sala)})
    }
    async counterSalasActivas() {
        const salas = await this.dao.getAll();
        /*
        * var salasActivas = salas.filter( enabled => enabled = true).length
        */
        var salasActivas = salas;
        return salasActivas.map((salasActivas) => {
            return this.mapToDto(salasActivas);
        });
    }
    async getSearch(dto) {
        const salas = await this.dao.getSearch({
            idOwner: dto.idOwner,
            idType: dto.idType
            //idLocality: dto.idLocality
        });
        return salas.map((sala) => {
            return this.mapToDto(sala);
        });
    }
    async findSalaById(id) {
        const sala = await this.dao.findById2(id);
        console.log("service get sala encontrada id: ", id);
        return this.mapToDto(sala);
    }
    async findSalaByOwner(idOwner) {
        const salas = await this.dao.getByOwner(idOwner);
        console.log('service salas, salas by user: ', salas);
        return salas.map((sala) => {
            return this.mapToDto(sala);
        });
    }
    //{ data: SalaDeEnsayo[]; total: number; page: number; totalPages: number }
    async findSalaByOwnerPaginated(idOwner, page = 1, limit = 10) {
        const result = await this.dao.getByOwnerPaginated(idOwner, page, limit);
        return {
            data: result.data.map((sala) => this.mapToDto(sala)),
            total: result.total,
            page: result.page,
            totalPages: result.totalPages
        };
    }
    //TODO update imagenes de sala de ensayo, solo agregar imagenes a sala de ensayo.
    async updateSalaDeEnsayoImagenes(id, dto) {
        const exists = await this.dao.findById2(id);
        console.log('sala encontrada id: ', id);
        if (!exists) {
            throw new Error('Sala de ensayo no encontrada');
        }
        const updatedSala = await this.dao.updateSalaImages(id, dto);
        if (!updatedSala) {
            throw new Error('Error al actualizar la sala de ensayo');
        }
        return this.mapToDto(updatedSala);
    }
    // rehacer, modificar codigo update y delete
    async updateSalaDeEnsayo(id, dto) {
        const sala = await this.dao.findById(id);
        console.log('sala encontrada id: ', id);
        if (sala.enabled == dto.enabled) {
            console.log('service update Sala enabled iguales:', id);
            return this.mapToDto(await this.dao.updateSala(id, dto
            //{
            // nameSalaEnsayo: dto.nameSalaEnsayo,
            // calleDireccion: dto.calleDireccion,
            // numeroDireccion: dto.numeroDireccion,
            // duracionTurno: dto.duracionTurno,
            // precioHora: dto.precioHora,
            // comodidades: dto.comodidades,
            // descripcion: dto.descripcion,
            // enabled: dto.enabled,
            // createdAt: dto.createdAt,
            // horarios: dto.horarios,
            // imagenes: dto.imagenes
            //}
            ));
        }
        if (sala.enabled != dto.enabled) {
            console.log('service update Sala enabled distintos:');
            await this.dao.stopEnabledSala(id);
            //if(dto.enabled === "habilitado"){
            return this.mapToDto(await this.dao.updateSala(id, {
                nameSalaEnsayo: dto.nameSalaEnsayo,
                calleDireccion: dto.calleDireccion,
                numeroDireccion: dto.numeroDireccion,
                duracionTurno: dto.duracionTurno,
                precioHora: dto.precioHora,
                comodidades: dto.comodidades,
                descripcion: dto.descripcion,
                enabled: dto.enabled,
                createdAt: dto.createdAt,
                imagenes: dto.imagenes
            }));
            //} if(dto.enabled === "deshabilitado"){
            //     return this.mapToDto(
            //         await this.dao.updateSala(id,{
            //             nameSalaEnsayo: dto.nameSalaEnsayo,
            //             calleDireccion: dto.calleDireccion,
            //             numeroDireccion: dto.numeroDireccion,
            //             duracionTurno: dto.duracionTurno,
            //             precioHora: dto.precioHora,
            //             comodidades: dto.comodidades,
            //             descripcion: dto.descripcion,
            //             enabled: dto.enabled
            //         })
            //     )}
        }
        else {
            console.log('service update Sala otro:');
            return this.mapToDto(await this.dao.updateSala(id, {
                nameSalaEnsayo: dto.nameSalaEnsayo,
                calleDireccion: dto.calleDireccion,
                numeroDireccion: dto.numeroDireccion,
                duracionTurno: dto.duracionTurno,
                precioHora: dto.precioHora,
                comodidades: dto.comodidades,
                descripcion: dto.descripcion,
                enabled: dto.enabled,
                createdAt: dto.createdAt,
                imagenes: dto.imagenes
            }));
        }
    }
    async updateSalaDeEnsayoOpinion(id, dto) {
        const opinion = dto.opiniones;
        console.log('service, sala:', dto);
        console.log('service, opinion:', opinion);
        return this.mapToDto(await this.dao.updateSalaOpinion(id, {
            nameSalaEnsayo: dto.nameSalaEnsayo,
            calleDireccion: dto.calleDireccion,
            numeroDireccion: dto.numeroDireccion,
            precioHora: dto.precioHora
        }, opinion));
    }
    async deleteSalaDeEnsayo(id, dto) {
        return this.mapToDto(await this.dao.deleteSala(id, {
            nameSalaEnsayo: dto.nameSalaEnsayo,
            calleDireccion: dto.calleDireccion,
            numeroDireccion: dto.numeroDireccion,
            duracionTurno: dto.duracionTurno,
            deletedAt: new Date(),
            precioHora: dto.precioHora,
            comodidades: dto.comodidades,
            descripcion: dto.descripcion,
            enabled: dto.enabled,
            imagenes: dto.imagenes
        }));
    }
    async borrarSalaBd(id) {
        const salaToDelete = this.dao.findById2(id);
        const owner = (await salaToDelete).idOwner;
        console.log('salaDeEnsayotoDelete: ', salaToDelete);
        console.log('owner sala de ensayo: ', owner);
        //delete sala from bd
        await this.dao.borrarSala(id);
        // delete sala from user's array sala_de_ensayo
        // await UserModel.findByIdAndUpdate(owner._id, {
        //     $pull: { idSalaDeEnsayo: id }
        // })
        return true;
    }
    async obtenerCantidadNuevasSdEPorMes(fechaInicio, fechaFin) {
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
                const cantidad = await model_1.SalaDeEnsayoModel.countDocuments({
                    createdAt: {
                        $gte: fechaActual,
                        $lt: fechaSiguiente
                    }
                });
                const nombreDelMes = this.obtenerNombreDelMes(fechaActual.getMonth());
                resultados.push({ año: fechaActual.getFullYear(), mes: //fechaActual.getMonth() + 1
                    nombreDelMes,
                    cantidad });
            }
            return resultados;
        }
        catch (error) {
            console.error('Error al obtener la cantidad de documentos por mes:', error);
            throw error;
        }
    }
    //reporte nuevos sde por mes v2
    async reporteNuevasSdE(fechaInicioStr, fechaFinStr) {
        try {
            // Convertir las fechas de string a Date
            const fechaInicio = new Date(fechaInicioStr);
            const fechaFin = new Date(fechaFinStr);
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
            const sde = await model_1.SalaDeEnsayoModel.find({
                createdAt: { $gte: fechaInicio, $lte: fechaFin },
            });
            // Agrupar las reservas por mes
            sde.forEach(sala => {
                const mes = sala.createdAt.toISOString().substring(0, 7); // formato YYYY-MM
                const index = labels.findIndex(label => label === this.getMonthAbbreviation(mes));
                if (index !== -1) {
                    data[index] += 1; // Incrementar contador
                }
            });
            console.log(`Salas de ensayo nuevas agrupados por mes: ${JSON.stringify({ labels, data })}`);
            return {
                labels,
                datasets: [{ data }]
            };
        }
        catch (error) {
            console.error(error);
            throw new Error('Error obteniendo salas de ensayo por mes');
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
    mapToDto(sala) {
        return {
            id: sala.id,
            nameSalaEnsayo: sala.nameSalaEnsayo,
            calleDireccion: sala.calleDireccion,
            numeroDireccion: sala.numeroDireccion,
            imagenes: sala.imagenes,
            idLocality: sala.idLocality,
            idOwner: sala.idOwner,
            precioHora: sala.precioHora,
            idType: sala.idType,
            duracionTurno: sala.duracionTurno,
            enabled: sala.enabled,
            descripcion: sala.descripcion,
            comodidades: sala.comodidades,
            opiniones: sala.opiniones,
            horarios: sala.horarios
        };
    }
    // maptoPopularSalaDto(sala: SalaDeEnsayoDto):PopularSalaDeEnsayoDto{
    //     return{
    //         id: sala.id,
    //         nameSalaEnsayo: sala.nameSalaEnsayo,
    //         calleDireccion: sala.calleDireccion,
    //         numeroDireccion: sala.numeroDireccion,
    //         idImagen: sala.idImagen,
    //         idLocality: sala.idLocality,
    //         idOwner: sala.idOwner,
    //         precioHora: sala.precioHora,
    //        // idType: sala.idType,
    //         duracionTurno: sala.duracionTurno,
    //         enabled: sala.enabled,
    //         descripcion: sala.descripcion,
    //         //comodidades: sala.comodidades,
    //         opiniones: sala.opiniones,
    //         salaOwner: sala.id
    //     }
    // }
    mapToDtoOpinion(document) {
        return {
            id: document.id,
            descripcion: document.descripcion,
            estrellas: document.estrellas,
            idUser: document.idUser,
            idRoom: document.idRoom,
            idArtist: document.idArtist,
        };
    }
    async obtenerCantidadValoraciones(idRoom) {
        try {
            // Crear un objeto para almacenar la cantidad de valoraciones de cada tipo
            const valoracionesCount = {};
            // Buscar las opiniones asociadas a la sala
            const idSala = mongoose.Types.ObjectId(idRoom);
            const opiniones = await model_1.OpinionModel.find({ idRoom: idSala }).exec();
            console.log('opiniones: ', opiniones);
            // Contar la cantidad de valoraciones de cada tipo
            for (const opinion of opiniones) {
                const valoracionStr = opinion.estrellas.toString();
                if (valoracionesCount[valoracionStr]) {
                    valoracionesCount[valoracionStr]++;
                }
                else {
                    valoracionesCount[valoracionStr] = 1;
                }
            }
            // Crear el arreglo de labels y datasets en el formato deseado
            const labels = Array.from({ length: 5 }, (_, i) => (i + 1).toString()); // "1", "2", "3", "4", "5"
            const data = labels.map((label) => valoracionesCount[label] || 0);
            // Devolver el resultado en el formato deseado
            return {
                labels,
                datasets: [
                    {
                        data,
                    },
                ],
            };
        }
        catch (error) {
            console.error("Error al obtener cantidad de valoraciones:", error);
            throw error;
        }
    }
    async obtenerCantidadValoracionesDos(idRoom) {
        try {
            // Crear un objeto para almacenar la cantidad de valoraciones de cada tipo
            // const valoracionesCount: { [key: string]: number } = {};
            const labels = Array.from({ length: 5 }, (_, i) => (i + 1).toString()); // "1", "2", "3", "4", "5"
            const data = labels.map((label) => 0);
            // Buscar las opiniones asociadas a la sala
            const opiniones = await model_1.OpinionModel.find({ idRoom: idRoom }).exec();
            console.log('opiniones: ', opiniones);
            // for para contar la cantidad de estrellas que tiene la sala
            for (let i = 1; i <= 5; i++) {
                const cantidad = await model_1.OpinionModel.countDocuments({
                    estrellas: i,
                    idRoom: idRoom
                });
                data[i - 1] = cantidad;
            }
            // Devolver el resultado en el formato deseado
            return {
                labels,
                datasets: [
                    {
                        data,
                    },
                ],
            };
        }
        catch (error) {
            console.error("Error al obtener cantidad de valoraciones:", error);
            throw error;
        }
    }
    // service para opinion
    async createOpinion(dto) {
        return this.mapToDtoOpinion(await this.dao.createOpinion({
            descripcion: dto.descripcion,
            estrellas: dto.estrellas,
            idUser: dto.idUser,
            idRoom: dto.idRoom,
            idArtist: dto.idArtist
        }));
    }
    async createOpinionArtist(dto) {
        return this.mapToDtoOpinion(await this.dao.createOpinionArtist({
            descripcion: dto.descripcion,
            estrellas: dto.estrellas,
            idUser: dto.idUser,
            idArtist: dto.idArtist
        }));
    }
    async updateOpinion(id, dto) {
        return this.mapToDtoOpinion(await this.dao.updateOpinion({
            id: id,
            descripcion: dto.descripcion,
            estrellas: dto.estrellas,
            idUser: dto.idUser,
            idArtist: dto.idArtist,
            idRoom: dto.idRoom
        }));
    }
    //TODO hacer delete de opinion y getters quizas
    async getOpinionByUserAndRoom(idUser, idRoom) {
        const opinion = await this.dao.getOpinionByUserAndRoom(idUser, idRoom);
        return this.mapToDtoOpinion(opinion);
    }
    async getOpinionByUserAndArtist(idUser, idArtist) {
        const opinion = await this.dao.getOpinionByUserAndArtist(idUser, idArtist);
        return this.mapToDtoOpinion(opinion);
    }
    async getOpinionById(idOpinion) {
        const opinion = await this.dao.getOpinionById(idOpinion);
        return this.mapToDtoOpinion(opinion);
    }
    //get opiniones sobre un artista
    async getOpinionToArtist(idArtist) {
        const opiniones = await this.dao.getOpinionToArtist(idArtist);
        console.log('service promedio estrellas de artista opiniones, get opiniones: ', opiniones);
        return opiniones.map((opinion) => {
            return this.mapToDtoOpinion(opinion);
        });
    }
    async getMyAllOpiniones(idUser) {
        const salas = await this.findSalaByOwner(idUser);
        const opiniones = await Promise.all(salas.map(async (sala) => {
            const opinionesSala = await this.dao.getOpinionByRoom(sala.id);
            return {
                sala: sala,
                opiniones: opinionesSala.map((opinion) => this.mapToDtoOpinion(opinion))
            };
        }));
        return opiniones;
    }
}
exports.SalaService = SalaService;
exports.instance = new SalaService(dao.instance);
