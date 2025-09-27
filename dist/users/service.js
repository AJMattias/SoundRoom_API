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
exports.instance = exports.UsersService = void 0;
const dao = __importStar(require("./dao"));
const models_1 = require("./models");
const exception_1 = require("../common/exception/exception");
const jwt = __importStar(require("jsonwebtoken"));
const dotenv = __importStar(require("dotenv"));
const Email = __importStar(require("../server/MailCtrl"));
const password_reset_1 = require("./password_reset");
dotenv.config();
const model_1 = require("../sala_de_ensayo/model");
const models_2 = require("../perfil/models");
var mongoose = require('mongoose');
class UsersService {
    constructor(usersDao) {
        // helper parsea
        this.obtenerNombreDelMes = (mes) => {
            const nombresDeMeses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
            return nombresDeMeses[mes];
        };
        this.dao = usersDao;
    }
    /***
     * Guarda un usuario en la base de datos y retorna el usuario creado
     * TODO : validar
     */
    async createUser(dto) {
        const user = await this.dao.store({
            name: dto.name,
            last_name: dto.last_name,
            password: dto.password,
            email: dto.email,
            createdAt: new Date(),
            image_id: undefined,
            idPerfil: dto.idPerfil,
            idArtistType: dto.idArtistType,
            idArtistStyle: dto.idArtistStyle,
            enabled: "habilitado",
            userType: dto.userType,
            idSalaDeEnsayo: dto.idSalaDeEnsayo,
            tipoArtista: dto.tipoArtista
        });
        console.log('service user created: ', user);
        const msg = "Usted ha creado la cuenta exitosamente. Gracias por elegirnos y dirigite a SoundRoom";
        //en caso que no funcione bien el mail, pasar la cadena de string directamente como parametro en sendMailPiola en vez de var msg
        await this.sendMailPiola(user.email, msg);
        return this.mapToDto(user);
    }
    async createUser2(dtotwo) {
        return this.mapToDto(await this.dao.storetwo({
            name: dtotwo.name,
            last_name: dtotwo.last_name,
            password: dtotwo.password,
            email: dtotwo.email,
            createdAt: new Date(),
            image_id: undefined,
        }));
    }
    /**
     * Busca a un usuario a partir de una ID.
     * Tira un ModelNotFoundException si no encuentra a la Entidad
     * @param id {string} la id  del usuario a buscar
     * @returns {UserDto} el usuario encontrado.
     * @throws {ModelNotFoundException}
     */
    async findUserById(id) {
        const user = await this.dao.findById(id);
        return this.mapToDto(user);
    }
    async findUserByEmail(email) {
        const user = await this.dao.findByEmail(email);
        return this.mapToDto(user);
    }
    /**
     *  Funcion de prueba que nos devuelve todos los usuarios en la base de datos
     */
    async getAllUsers() {
        const users = await this.dao.getAll();
        return users.map((user) => {
            return this.mapToDto(user);
        });
    }
    async getAllUsersUA() {
        const users = await this.dao.getAllUA();
        return users.map((user) => {
            return this.mapToDto(user);
        });
    }
    // async getNewUsersReport(fechaI: string, fechaH: string) : Promise<Array<ReporteUsersDto>>{
    //     let dateInit = new Date(fechaI);
    //     let dateEnd = new Date(fechaH);
    //     let reporteDto = []
    //     // Ordenamos las fechas para que la mas antigua sea la primera
    //     if (dateInit > dateEnd){
    //         var temp = dateInit;
    //         dateInit = dateEnd;
    //         dateEnd = temp;
    //     }
    //     // obtener mes de cada fecha
    //     const [yearI, monthI, dayI, ] = fechaI.split('/');
    //     const [yearH, monthH, dayH, ] = fechaI.split('/');
    //     //castear string to number
    //     const mesI = parseInt(monthI)
    //     const mesH = parseInt(monthH)
    //     for(let i=mesI;i<=mesH;i++){
    //         //armar las fechas para buscar en el mismo mes fechaI y fechaH
    //         const diaI = 
    //         const reportesUsuarios = await this.dao.findUsersBetwenDates(dateInit, dateEnd)
    //         //contar longitud del array y armar el dto con el mes y cantidad
    //         //añadir a reporteDto cada encontrado
    //     }
    //     const reportesUsuarios = await this.dao.findUsersBetwenDates(dateInit, dateEnd)
    //     // mapear dto con mes y cantidad
    //     return reportesUsuarios.map((data)=>this.mapToReporte(data));
    // }
    //     return users.map((user: User) => {
    //         return this.mapToDto(user)
    //     })
    // }
    async getAllUsersPp() {
        const users = await this.dao.getAllUserPerfilPermiso();
        return users.map((user) => {
            return this.mapToDto(user);
        });
    }
    async updateUserState(userId, dto) {
        //comparar atributo enabled y ejecutar segun cambia  
        try {
            //El usuario se da de baja, "eliminar perfil"
            if (dto.enabled === "baja") {
                console.log("service baja: ", dto.enabled);
                await this.dao.stopDisableUser(userId);
                return this.mapToDto(await this.dao.bajaUser(userId, {
                    name: dto.name,
                    last_name: dto.last_name,
                    email: dto.email,
                    password: dto.password,
                    createdAt: dto.createdAt,
                    deletedAt: new Date(),
                    image_id: undefined,
                    enabled: dto.enabled,
                    idPerfil: dto.idPerfil,
                    idArtistType: dto.idArtistType,
                    idArtistStyle: dto.idArtistStyle,
                    userType: dto.userType,
                    idSalaDeEnsayo: dto.idSalaDeEnsayo,
                    tipoArtista: dto.tipoArtista
                }));
            }
            //El administrador deshabilita el usuario
            if (dto.enabled === "deshabilitado") {
                await this.dao.stopDisableUser(userId);
                return this.mapToDto(await this.dao.disableUser(userId, {
                    name: dto.name,
                    last_name: dto.last_name,
                    email: dto.email,
                    password: dto.password,
                    createdAt: dto.createdAt,
                    deletedAt: new Date(),
                    image_id: undefined,
                    enabled: dto.enabled,
                    idPerfil: dto.idPerfil,
                    idArtistType: dto.idArtistType,
                    idArtistStyle: dto.idArtistStyle,
                    userType: dto.userType,
                    idSalaDeEnsayo: dto.idSalaDeEnsayo,
                    tipoArtista: dto.tipoArtista,
                }));
            }
            else 
            //El administrador habilita el usuario
            if (dto.enabled === "habilitado") {
                await this.dao.stopDisableUser(userId);
                return this.mapToDto(await this.dao.enabledUser(userId, {
                    name: dto.name,
                    last_name: dto.last_name,
                    email: dto.email,
                    password: dto.password,
                    createdAt: dto.createdAt,
                    deletedAt: new Date(),
                    image_id: undefined,
                    enabled: dto.enabled,
                    idPerfil: dto.idPerfil,
                    idArtistType: dto.idArtistType,
                    idArtistStyle: dto.idArtistStyle,
                    userType: dto.userType,
                    idSalaDeEnsayo: dto.idSalaDeEnsayo,
                    tipoArtista: dto.tipoArtista,
                }));
            }
            else {
                // Manejo de caso inesperado
                throw new Error(`Estado de usuario no reconocido: ${dto.enabled}`);
            }
        }
        catch (error) {
            console.log('error al cambiar estado de usuario: ', error);
            throw error;
        }
    }
    async updateUser(userId, dto) {
        return this.mapToDto(await this.dao.updateUser(userId, {
            name: dto.name,
            last_name: dto.last_name,
            email: dto.email,
            password: dto.password,
            createdAt: dto.createdAt,
            deletedAt: dto.deletedAt,
            image_id: undefined,
            enabled: 'habilitado',
            idPerfil: dto.idPerfil,
            idArtistType: dto.idArtistType,
            idArtistStyle: dto.idArtistStyle,
            userType: dto.userType,
            idSalaDeEnsayo: dto.idSalaDeEnsayo,
            tipoArtista: dto.tipoArtista,
            enabledHistory: dto.enabledHistory
        }));
    }
    //TODO-> Agregar funcion para cambiar el estado anterior, es decir agregar fecha hasta en
    //TODO-> enabledHistory y cambiar al estado nuevo
    async updatePassword(userId, dto) {
        //TODO recibir contraseña vieja y nueva. comparar contraseña vieja y actualizar contraseña, login con nueva contraseña
        const passwordU = dto.password;
        return this.mapToDto(await this.dao.updatePassword(userId, passwordU));
    }
    async updateAddSala(userId, dto) {
        const idSala = dto.idSalaDeEnsayo;
        return this.mapToDto(await this.dao.updateUserSalas(userId, idSala));
    }
    /**
     *  Funcion para logearse y obtener un token JWT .
     *  Este token se va a usar en todas las requests para un usuario autenticado.
     */
    async login(email, password) {
        console.log(' srvicio auth - email, password: ', email, password);
        const user = await this.dao.findByEmail(email);
        if (user.password != password) {
            throw new exception_1.AuthenticationException();
        }
        const userDto = this.mapToDto(user);
        const jwtKey = process.env.JWT_KEY;
        if (!jwtKey) {
            console.error("JWT_KEY missing from .env file. Please create one or copy it from .env-demo");
            throw new exception_1.ServerException();
        }
        return {
            user: userDto,
            token: jwt.sign(userDto, jwtKey)
        };
    }
    async loginWithToken(email, token) {
        const user = await this.dao.findByEmail(email);
        if (!password_reset_1.passwordTokens.checkToken(email, token)) {
            throw new exception_1.AuthorizationException();
        }
        //MIO: chek if email exist, si no existe mandar msg: "El email ingresado no existe”.
        if (!user) {
            return {
                error: 404,
                msg: "El email ingresado no existe"
            };
        }
        const userDto = this.mapToDto(user);
        const jwtKey = process.env.JWT_KEY;
        if (!jwtKey) {
            console.error("JWT_KEY missing from .env file. Please create one or copy it from .env-demo");
            throw new exception_1.ServerException();
        }
        return {
            user: userDto,
            token: jwt.sign(userDto, jwtKey)
        };
    }
    async resetPassword(email) {
        const user = await this.dao.findByEmail(email);
        const token = password_reset_1.passwordTokens.createToken(email);
        await this.sendMail(user.email, "Su código de login es " + token, "Recuperacion contraseña");
        return {
            email: email,
            token: token
        };
    }
    /**
     * Funcion quu nos permite mapear las entidades de dominio User en UserDto para devolver en el json.
     * @param user {User} clase de dominio de User a convertir
     * @returns {UserDto} el dto a devolver como json por routes
     */
    mapToDto(user) {
        return {
            name: user.name,
            last_name: user.lastName,
            email: user.email,
            password: user.password,
            idPerfil: user.idPerfil,
            idArtistType: user.idArtistType,
            idArtistStyle: user.idArtistStyle,
            idSalaDeEnsayo: user.idSalaDeEnsayo,
            id: user.id,
            isAdmin: user.isAdmin,
            enabled: user.enabled,
            createdAt: user.createdAt,
            deletedAt: user.deletedAt,
            userType: user.userType,
            tipoArtista: user.tipoArtista,
            enabledHistory: user.enabledHistory
        };
    }
    mapToReporte(reporte) {
        return {
            mes: reporte.mes,
            cantidad: reporte.cantidad
        };
    }
    async sendMailPiola(to, message) {
        const mailOptions = {
            from: 'soundroomapp@gmail.com',
            to: to,
            subject: "Registro de usuarios",
            html: '<div id=":pf" class="a3s aiL "><table><tbody> <tr> <td style="padding:16px 24px"> <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%"> <tbody> <tr> <td> <table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="auto"> <tbody> <tr> <td> <img alt="Imagen de SoundRoom" border="0" height="70" width="70" src="https://fs-01.cyberdrop.to/SoundRoom_logo-X6fFVkX9.png" style="border-radius:50%;outline:none;color:#ffffff;max-width:unset!important;text-decoration:none" class="CToWUd"></a></td> </tr> </tbody> </table></td> </tr> <tr> <td> <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" align="center" style="max-width:396px;padding-bottom:4px;text-align:center"> <tbody> <tr> <td><h2 style="margin:0;color:#262626;font-weight:400;font-size:16px;line-height:1.5">' + "Usted ha creado la cuenta exitosamente. Gracias por elegir SoundRoom" + '</h2></td> </tr> </tbody> </table></td> </tr></tbody></table></div>',
            text: message,
            //borrar todo html en caso de que se rompa je
        };
        await Email.sendEmailAsync(mailOptions);
    }
    async sendMail(to, message, subject) {
        const mailOptions = {
            from: 'soundroomapp@gmail.com',
            to: to,
            //subject: "Registro de usuarios",
            subject: subject,
            text: message,
            //borrar todo html en caso de que se rompa je
        };
        await Email.sendEmailAsync(mailOptions);
    }
    // reportes
    daysInMonth(month, year) {
        return new Date(year, month, 0).getDate();
    }
    // intento mio incompleto
    // async reporteUserByDateRange(fechaI: string, fechaH: string): Promise<number>{
    //     // convertir string a Date:
    //     //https://bobbyhadz.com/blog/typescript-convert-string-to-date#convert-a-string-to-a-date-object-in-typescript
    //     const  fechaInicio = new Date(fechaI)
    //     const  fechaHasta= new Date(fechaH)
    //     const monthI = fechaInicio.getMonth()
    //     const monthH = fechaHasta.getMonth()
    //     let newObj = Intl.DateTimeFormat('en-US', {
    //         timeZone: "America/Argentina/Buenos_Aires"
    //      })
    //      let fir = newObj.format(fechaInicio)
    //      console.log(fir)
    //     console.log("Servicio, rango de fechas- Desde", fechaInicio, "hasta", fechaHasta)
    //     console.log("mes inicio: " , fechaInicio.getMonth(), "mes fin: ", fechaHasta.getMonth() )
    //     let dtoNewUsersReportes = []
    //     var contadorUsers = 0
    //     //luego contar por mes
    //     for(let i: number = monthI; i <=monthH ;i++){
    //         //crear fechas intermedias para buscar por mes
    //         console.log("mes: ", i)
    //         let fechaInicioIntermedia = new Date(fechaInicio)
    //         fechaInicioIntermedia.setDate(fechaInicio.getDate())
    //         fechaInicioIntermedia.setMonth(fechaInicio.getMonth()+1)   
    //         fechaInicioIntermedia.setFullYear(fechaInicio.getFullYear())
    //         console.log("fecha Inicio", fechaInicioIntermedia)
    //         let fechaHastaIntermedia = new Date()
    //         //check if mes es final, ver usar dia de fechaHasta
    //         if (i = monthH){
    //             console.log( "i = month")
    //             fechaHastaIntermedia = fechaHasta
    //         } 
    //         const diasmes = this.daysInMonth(i,  fechaHasta.getFullYear())
    //         fechaHastaIntermedia.setDate(diasmes)
    //         console.log("dias en el mes", diasmes)
    //         console.log("fecha Hasta", fechaHastaIntermedia)
    //         //no funciona, de vuelve 0
    //         const countUsers: number = await SalaDeEnsayoModel.countDocuments({
    //             //createdAt: { $lte: new Date('2019-01-01'), $gte: new Date('2020-01-01') }
    //             createdAt: { $gte: fechaInicioIntermedia, $lte: fechaHastaIntermedia }
    //         })
    //         const reporteDto = this.mapToReporte({
    //             mes: i,
    //             cantidad: countUsers
    //         })
    //         console.log("mes: ", i, "typeOf: ",  typeof i)
    //         dtoNewUsersReportes.push(reporteDto)
    //         console.log(countUsers)
    //         contadorUsers = countUsers
    //     // return this.mapToReporte((reporte: Reporte) => {
    //     // })
    //     }
    // console.log(dtoNewUsersReportes)
    // return contadorUsers
    // }
    //reporte nuevos usuarios
    // funcionando: Función para obtener la cantidad de documentos por mes entre dos fechas
    async obtenerCantidadDocumentosPorMes(fechaInicio, fechaFin) {
        try {
            // Parsear fechas
            const fechaInicioObj = new Date(fechaInicio);
            const fechaFinObj = new Date(fechaFin);
            console.log("fecha Inicio", fechaInicioObj);
            console.log("fecha Fin", fechaFinObj);
            // Obtener la diferencia en meses
            const diffMeses = (fechaFinObj.getFullYear() - fechaInicioObj.getFullYear()) * 12 + fechaFinObj.getMonth() - fechaInicioObj.getMonth();
            // Inicializar el array de resultados
            const resultados = [];
            // Consultar la cantidad de documentos por mes
            for (let i = 0; i < diffMeses; i++) {
                const fechaActual = new Date(fechaInicioObj.getFullYear(), fechaInicioObj.getMonth() + i, 1);
                const fechaSiguiente = new Date(fechaInicioObj.getFullYear(), fechaInicioObj.getMonth() + i + 1, 1);
                const cantidad = await models_1.UserModel.countDocuments({
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
    //reporte nuevos usuarios v2
    async reporteNuevosUsuarios(fechaInicioStr, fechaFinStr) {
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
            const users = await models_1.UserModel.find({
                createdAt: { $gte: fechaInicio, $lte: fechaFin }
            });
            // Agrupar las reservas por mes
            users.forEach(user => {
                const mes = user.createdAt.toISOString().substring(0, 7); // formato YYYY-MM
                const index = labels.findIndex(label => label === this.getMonthAbbreviation(mes));
                if (index !== -1) {
                    data[index] += 1; // Incrementar contador
                }
            });
            console.log(`Usuarios nuevos agrupados por mes: ${JSON.stringify({ labels, data })}`);
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
    //reporte nuevos artistas por mes
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
                const cantidad = await models_1.UserModel.countDocuments({
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
    //reporte nuevos artistas por mes v2
    async reporteNuevosArtistas(fechaInicioStr, fechaFinStr) {
        try {
            // Convertir las fechas de string a Date
            const fechaInicio = new Date(fechaInicioStr);
            const fechaFin = new Date(fechaFinStr);
            // Crear arrays para labels y data
            let labels = [];
            let data = [];
            // Busca el perfil con el nombre "artista"
            const perfilArtista = await models_2.PerfilModel.findOne({ name: "Artista" }).select('_id');
            if (!perfilArtista) {
                throw new Error('Perfil "artista" no encontrado');
            }
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
            const perfilArtistaId = mongoose.Types.ObjectId(perfilArtista._id);
            // Encontrar las reservas que coincidan con las condiciones
            const users = await models_1.UserModel.find({
                createdAt: { $gte: fechaInicio, $lte: fechaFin },
                idPerfil: perfilArtistaId
            });
            // Agrupar las reservas por mes
            users.forEach(user => {
                const mes = user.createdAt.toISOString().substring(0, 7); // formato YYYY-MM
                const index = labels.findIndex(label => label === this.getMonthAbbreviation(mes));
                if (index !== -1) {
                    data[index] += 1; // Incrementar contador
                }
            });
            console.log(`Usuarios Artista nuevos agrupados por mes: ${JSON.stringify({ labels, data })}`);
            return {
                labels,
                datasets: [{ data }]
            };
        }
        catch (error) {
            console.error(error);
            throw new Error('Error obteniendo usuarios artistas por mes');
        }
    }
    //reporte usuariosactivos v1
    async reporteUsuariosActivos(fechaInicioStr, fechaFinStr) {
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
            // Encontrar los usuarios activos que coincidan con las condiciones
            const users = await models_1.UserModel.find({
                createdAt: { $gte: fechaInicio, $lte: fechaFin },
                enabled: "habilitado"
            });
            // Agrupar las reservas por mes
            users.forEach(user => {
                const mes = user.createdAt.toISOString().substring(0, 7); // formato YYYY-MM
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
    //reporte usuariosactivos v1
    //TODO revisar conteo documentos
    async obtenerUsuariosActivosPorMes(fechaInicio, fechaFin) {
        try {
            const startDate = new Date(fechaInicio);
            const endDate = new Date(fechaFin);
            // Declaración del objeto resultado
            const result = {
                labels: [],
                datasets: [
                    {
                        data: [],
                    },
                ],
            };
            let currentYear = startDate.getFullYear();
            let currentMonth = startDate.getMonth();
            while (currentYear < endDate.getFullYear() || (currentYear === endDate.getFullYear() && currentMonth <= endDate.getMonth())) {
                const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
                const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
                const count = await models_1.UserModel.countDocuments({
                    // $or:[
                    //     {
                    //         enabledHistory: {
                    //             $elemMatch: {
                    //             status: 'habilitado',
                    //             dateFrom: { $gte: startOfCurrentMonth, $lt: endOfCurrentMonth },
                    //             $and: [
                    //                 { dateTo: { $gt: startOfCurrentMonth, $lte: endOfCurrentMonth } },
                    //                 { dateTo: null }, // Si dateTo es null, significa que aún está habilitado
                    //                 { dateTo: { $exists: false } } // dateTo does not exist
                    //             ],
                    //             },
                    //         },
                    //     },
                    //     {
                    //         enabledHistory: {
                    //             $elemMatch: {
                    //             status: 'habilitado',
                    //             dateFrom: { $lte: endOfCurrentMonth },
                    //             $and: [
                    //                 { dateTo: { $gte: endOfCurrentMonth, $lte: fechaFin } }
                    //             ],
                    //             },
                    //         },
                    //     },
                    //     {
                    //         enabledHistory: {
                    //             $elemMatch: {
                    //                 status: 'habilitado',
                    //                 dateFrom: { $lte: endOfCurrentMonth },
                    //                 dateTo: { $gte: startOfCurrentMonth }
                    //             }
                    //         }
                    //     }
                    // ]
                    enabledHistory: {
                        $elemMatch: {
                            status: 'habilitado',
                            dateFrom: { $lte: endOfCurrentMonth },
                            $or: [
                                { dateTo: { $exists: false } },
                                { dateTo: { $gte: startOfCurrentMonth } } // dateTo en el mes actual o después
                            ]
                        }
                    }
                });
                // Llenado del objeto result
                let monthLabel = startOfCurrentMonth.toLocaleString('default', { month: 'short' });
                monthLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
                result.labels.push(monthLabel);
                result.datasets[0].data.push(count);
                // Avanzar al siguiente mes
                currentMonth++;
                if (currentMonth > 11) {
                    currentMonth = 0;
                    currentYear++;
                }
            }
            result.labels.shift();
            result.datasets[0].data.shift();
            // Retorno del objeto result con los datos llenados
            return result;
        }
        catch (error) {
            console.error(error);
            throw new Error('Error obteniendo usuarios activos por mes');
        }
    }
    //nueva version reporte baja 
    //reporte usuarios baja
    async obtenerUsuariosBajaPorMes(fechaInicio, fechaFin) {
        try {
            const startDate = new Date(fechaInicio);
            const endDate = new Date(fechaFin);
            // Declaración del objeto resultado
            const result = {
                labels: [],
                datasets: [
                    {
                        data: [],
                    },
                ],
            };
            let currentYear = startDate.getFullYear();
            let currentMonth = startDate.getMonth();
            while (currentYear < endDate.getFullYear() || (currentYear === endDate.getFullYear() && currentMonth <= endDate.getMonth())) {
                const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
                const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
                const count = await models_1.UserModel.countDocuments({
                    enabledHistory: {
                        $elemMatch: {
                            status: 'baja',
                            dateFrom: { $lte: endOfCurrentMonth },
                            $or: [
                                { dateTo: { $gte: startOfCurrentMonth } },
                                { dateTo: null }, // Si dateTo es null, significa que aún está habilitado
                            ],
                        },
                    },
                });
                // Llenado del objeto result
                let monthLabel = startOfCurrentMonth.toLocaleString('default', { month: 'short' });
                monthLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
                result.labels.push(monthLabel);
                result.datasets[0].data.push(count);
                // Avanzar al siguiente mes
                currentMonth++;
                if (currentMonth > 11) {
                    currentMonth = 0;
                    currentYear++;
                }
            }
            result.labels.shift();
            result.datasets[0].data.shift();
            // Retorno del objeto result con los datos llenados
            return result;
        }
        catch (error) {
            console.error(error);
            throw new Error('Error obteniendo usuarios activos por mes');
        }
    }
    //reporte baja version deprecada
    async reporteUsuariosBajaPorMes(fechaInicio, fechaFin) {
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
                const cantidad = await models_1.UserModel.countDocuments({
                    deletedAt: {
                        $gte: fechaActual,
                        $lt: fechaSiguiente
                    },
                    enabled: "baja"
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
    async propietariosAlquilanSala(fechaInicioS, fechaFinS) {
        const fechaInicioObj = new Date(fechaInicioS);
        const fechaFinObj = new Date(fechaFinS);
        try {
            const resultados = [];
            // Utilizamos un bucle para recorrer los meses entre las fechas de inicio y fin
            const currentDate = new Date(fechaInicioObj);
            while (currentDate <= fechaFinObj) {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1;
                // Utilizamos agregación para contar usuarios con salas de ensayo habilitadas en el mes actual
                const count = await models_1.UserModel.aggregate([
                    { $lookup: { from: 'Sala_De_Ensayo', localField: 'idRoom', foreignField: '_id', as: 'salas' } },
                    { $unwind: '$salas' },
                    { $match: { 'salas.enabled': true } },
                    { $addFields: { mes: { $month: '$createdAt' }, año: { $year: '$createdAt' } } },
                    { $match: { mes: month, año: year } },
                    { $group: { _id: '$_id', count: { $sum: 1 } } },
                    { $group: { _id: null, total: { $sum: '$count' } } } // Sumar el total de usuarios
                ]);
                // Si no hay usuarios con salas de ensayo habilitadas en el mes actual, agregamos 0 al resultado
                const quantity = count.length > 0 ? count[0].total : 0;
                const nombreDelMes = this.obtenerNombreDelMes(currentDate.getMonth());
                resultados.push({ año: currentDate.getFullYear(), mes: //fechaActual.getMonth() + 1
                    nombreDelMes,
                    cantidad: quantity });
                // Avanzamos al siguiente mes
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
            // Devolvemos el array con los resultados por mes
            return resultados;
        }
        catch (error) {
            console.error('Error al contar usuarios con sala de ensayo habilitada por mes:', error);
            throw error;
        }
    }
    async propietariosAlquilanSala2(fechaInicioS, fechaFinS) {
        const fechaInicioObj = new Date(fechaInicioS);
        const fechaFinObj = new Date(fechaFinS);
        try {
            const resultados = [];
            // Utilizamos un bucle para recorrer los meses entre las fechas de inicio y fin
            const currentDate = new Date(fechaInicioObj);
            while (currentDate <= fechaFinObj) {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1;
                // Ajustamos las fechas de inicio y fin del mes actual
                const inicioMes = new Date(year, month - 1, 1);
                const finMes = new Date(year, month, 1);
                // Utilizamos agregación para contar usuarios con salas de ensayo habilitadas en el mes actual
                const count = await model_1.SalaDeEnsayoModel.aggregate([
                    {
                        $match: {
                            enabled: true,
                            createdAt: {
                                $gte: inicioMes,
                                $lt: finMes
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$idOwner"
                        }
                    },
                    {
                        $count: "total"
                    }
                ]);
                // Si no hay usuarios con salas de ensayo habilitadas en el mes actual, agregamos 0 al resultado
                const quantity = count.length > 0 ? count[0].total : 0;
                const nombreDelMes = this.obtenerNombreDelMes(currentDate.getMonth());
                resultados.push({ mes: nombreDelMes, cantidad: quantity });
                // Avanzamos al siguiente mes
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
            // Devolvemos el array con los resultados por mes
            return resultados;
        }
        catch (error) {
            console.error("Error al contar usuarios con sala de ensayo habilitada por mes:", error);
            throw error;
        }
    }
    // const startDate = new Date(fechaInicioS);
    // const endDate = new Date(fechaFinS);
    // // Crear arrays para labels y data
    // let labels: string[] = [];
    // let data: number[] = [];
    // // Generar la lista de todos los meses entre fechaInicio y fechaFin
    // let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    // let end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    // // Buscar los usuarios creados desde la fechaInicio y con perfil.name = 'saladeensayo'
    // const perfil = await PerfilModel.findOne({ name: 'Sala de Ensayo' }).exec();
    // if (!perfil) return { labels, datasets: [{ data }] };
    // const perfilid = new mongoose.Types.ObjectId(perfil._id);
    // const usuarios = await UserModel.find({
    //     idPerfil: perfilid,
    //     createdAt: { $lte: endDate }
    // }).exec();
    // console.log('usuarios sde: ', usuarios)
    // while (current <= end) {
    //     const mes = current.toISOString().substring(0, 7); // formato YYYY-MM
    //     labels.push(this.getMonthAbbreviation(mes));
    //     data.push(0); // Inicializar a 0
    //     current.setMonth(current.getMonth() + 1);
    // }
    // data[1]=0
    // labels.shift()
    // data.shift()
    // let startDateM = startDate
    // // Iterar sobre los meses
    // while (startDateM <= endDate) {
    //     let c = 0
    //     // Obtener el primer día del mes
    //     const firstDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    //     // Obtener el último día del mes
    //     const lastDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    //     console.log(`Primer día del mes: ${firstDayOfMonth}`);
    //     console.log(`Último día del mes: ${lastDayOfMonth}`);
    //     for (const usuario of usuarios){
    //         const userid = new mongoose.Types.ObjectId(usuario._id);
    //         const salasDeEnsayo = await SalaDeEnsayoModel.find({
    //             idOwner: userid,
    //             enabledHistory: {
    //                 $elemMatch: {
    //                     $or: [
    //                         { dateTo: null }, // Si la sala aún está habilitada
    //                         {
    //                             dateFrom: { $gte: startDate, $lt: endDate }, // Fecha de inicio dentro del mes
    //                             dateTo: { $gte: startDate, $lt: endDate } // Fecha de fin dentro del mes, si está definida
    //                         }
    //                     ],
    //                     status: 'habilitado' // Status especificado
    //                 }
    //             },
    //             enabled: 'habilitado' // Condición para asegurarse de que la sala está habilitada
    //         }).limit(1).exec();
    //         console.log('sala de ensayo encontrada: ', salasDeEnsayo)
    //         data[c]++
    //         c++
    //     }
    //     // Avanzar al siguiente mes
    //     startDateM = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
    // }
    // return {
    //     labels,
    //     datasets: [
    //         {
    //             data
    //         }
    //     ]
    // }
    //propietarios que alquilan v3
    async propietariosAlquilanSala3(fechaInicioS, fechaFinS) {
        // try {
        //     // Convertir fechas de inicio y fin a Date
        //     //otra version:
        //     const startDate = new Date(fechaInicioS);
        //     const endDate = new Date(fechaFinS);
        //     // Declaración del objeto resultado
        //     const result = {
        //         labels: [] as string[],
        //         datasets: [
        //         {
        //             data: [] as number[],
        //         },
        //         ],
        //     };
        //     result.datasets[0].data[0] = 0;
        //     result.datasets[0].data[1] = 0;
        //     let currentYear = startDate.getFullYear();
        //     let currentMonth = startDate.getMonth();
        //     // Buscar los usuarios creados desde la fechaInicio y con perfil.name = 'saladeensayo'
        //     const perfil = await PerfilModel.findOne({ name: 'Sala de Ensayo' }).exec();
        //     if (!perfil) return {msg: "no se encontraron usuarios sala de ensayo"};
        //     const perfilid = new mongoose.Types.ObjectId(perfil._id);
        //     const usuarios = await UserModel.find({
        //         idPerfil: perfilid,
        //         enabled: 'habilitado',
        //         createdAt: { $lte: endDate }
        //     }).exec();
        //     console.log('usuarios sde: ', usuarios)
        //     let c = 0
        //     while (currentYear < endDate.getFullYear() || (currentYear === endDate.getFullYear() && currentMonth <= endDate.getMonth())) {
        //         result.datasets[0].data[c] = 0;
        //         const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
        //         const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
        //         //
        //         for (const usuario of usuarios){
        //             const userid = new mongoose.Types.ObjectId(usuario._id);
        //             const salasDeEnsayo = await SalaDeEnsayoModel.find({
        //                 idOwner: userid,
        //                 enabledHistory: {
        //                     $elemMatch: {
        //                         $or: [
        //                             { dateTo: null }, // Si la sala aún está habilitada
        //                             {
        //                                 dateFrom: { $gte: startOfCurrentMonth, $lt: endOfCurrentMonth }, // Fecha de inicio dentro del mes
        //                                 dateTo: { $gte: startOfCurrentMonth, $lt: endOfCurrentMonth } // Fecha de fin dentro del mes, si está definida
        //                             }
        //                         ],
        //                         status: 'habilitado' // Status especificado
        //                     }
        //                 },
        //                 enabled: 'habilitado' // Condición para asegurarse de que la sala está habilitada
        //             }).limit(1).exec();
        //             console.log('mes analizado: ', currentMonth, currentYear)
        //             console.log('sala de ensayo encontrada: ', salasDeEnsayo)
        //             result.datasets[0].data[c] ++;
        //             console.log('data: ', result.datasets)
        //         }
        //         // Llenado del objeto result
        //         let monthLabel = startOfCurrentMonth.toLocaleString('default', { month: 'short' });
        //         monthLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
        //         result.labels.push(monthLabel);
        //         //result.datasets[0].data.push(count);
        //         // Avanzar al siguiente mes
        //         currentMonth++;
        //         if (currentMonth > 11) {
        //         currentMonth = 0;
        //         currentYear++;
        //         }
        //         c++
        //     }
        //     result.labels.shift()
        //     result.datasets[0].data.shift()
        //     // Retorno del objeto result con los datos llenados
        //     return result;
        //     } catch (error) {
        //         console.error("Error en propietariosAlquilanSala3:", error);
        //         throw error;
        //     }
        try {
            // Convertir fechas de inicio y fin a Date
            const startDate = new Date(fechaInicioS);
            const endDate = new Date(fechaFinS);
            // Declaración del objeto resultado
            // Inicializar el arreglo de datos con ceros para cada mes en el rango
            const result = {
                labels: [],
                datasets: [
                    {
                        data: [],
                    },
                ],
            };
            const totalMonths = ((endDate.getFullYear() - startDate.getFullYear()) * 12) + endDate.getMonth() - startDate.getMonth() + 1;
            result.datasets[0].data = new Array(totalMonths).fill(0);
            let currentYear = startDate.getFullYear();
            let currentMonth = startDate.getMonth();
            let index = 0;
            // Buscar el perfil "Sala de Ensayo"
            const perfil = await models_2.PerfilModel.findOne({ name: 'Sala de ensayo' }).exec();
            if (!perfil) {
                const result = {
                    labels: ["Sin Resultados"],
                    datasets: [
                        {
                            data: [1],
                        },
                    ],
                };
                return result;
            }
            const perfilid = new mongoose.Types.ObjectId(perfil._id);
            const usuarios = await models_1.UserModel.find({
                idPerfil: perfilid,
                enabled: 'habilitado',
                createdAt: { $lte: endDate }
            }).exec();
            console.log('usuarios:', usuarios);
            while (currentYear < endDate.getFullYear() || (currentYear === endDate.getFullYear() && currentMonth <= endDate.getMonth())) {
                const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
                const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
                let count = 0;
                for (const usuario of usuarios) {
                    console.log('for de usuarios ');
                    const userid = new mongoose.Types.ObjectId(usuario._id);
                    const salasDeEnsayo = await model_1.SalaDeEnsayoModel.countDocuments({
                        idOwner: userid,
                        enabledHistory: {
                            // $elemMatch: {
                            //     $or: [
                            //         { dateTo: null }, // Si la sala aún está habilitada
                            //         {
                            //             dateFrom: { $gte: startOfCurrentMonth, $lt: endOfCurrentMonth }, // Fecha de inicio dentro del mes
                            //             dateTo: { $gte: startOfCurrentMonth, $lt: endOfCurrentMonth } // Fecha de fin dentro del mes, si está definida
                            //         }
                            //     ],
                            //     status: 'habilitado' // Status especificado
                            // }
                            // $elemMatch: {
                            //     dateFrom: { $lt: endOfCurrentMonth }, // La fecha de inicio debe ser antes del final del mes actual
                            //     dateTo: { $gte: startOfCurrentMonth }, // La fecha de fin debe ser después del inicio del mes actual o null
                            //     status: 'habilitado' // El estado debe ser habilitado
                            // }
                            $elemMatch: {
                                status: 'habilitado',
                                dateFrom: { $lte: endOfCurrentMonth },
                                $or: [
                                    { dateTo: { $gte: startOfCurrentMonth } },
                                    { dateTo: null }, // Si dateTo es null, significa que aún está habilitado
                                ],
                            },
                        },
                        enabled: 'habilitado' // Condición para asegurarse de que la sala está habilitada
                    }).exec();
                    console.log('salasDeEnsayo: ', salasDeEnsayo);
                    if (salasDeEnsayo > 0) {
                        count++;
                    }
                }
                // Llenado del objeto result
                let monthLabel = startOfCurrentMonth.toLocaleString('default', { month: 'short' });
                monthLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
                result.labels.push(monthLabel);
                result.datasets[0].data[index] = count;
                // Avanzar al siguiente mes
                currentMonth++;
                if (currentMonth > 11) {
                    currentMonth = 0;
                    currentYear++;
                }
                index++;
            }
            // Retorno del objeto result con los datos llenados
            result.labels.shift();
            result.datasets[0].data.shift();
            console.log('result: ', result);
            return result;
        }
        catch (error) {
            console.error("Error en propietariosAlquilanSala3:", error);
            throw error;
        }
    }
    mapToSalaDto(sala) {
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
        };
    }
}
exports.UsersService = UsersService;
exports.instance = new UsersService(dao.instance);
