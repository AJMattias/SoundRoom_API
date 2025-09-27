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
const service = __importStar(require("./service"));
const validator = __importStar(require("express-validator"));
const run_1 = require("../common/utils/run");
const middleware_1 = require("../server/middleware");
const constants_1 = require("../common/utils/constants");
const validator_utils_1 = require("../common/utils/validator_utils");
const generatePdf_1 = require("../common/utils/generatePdf");
const generateReportePdf_1 = require("../common/utils/generateReportePdf");
const mesesDiccionario_1 = require("../common/utils/mesesDiccionario");
const model_1 = require("../sala_de_ensayo/model");
//import fs from 'fs';
const fs = require('fs-extra');
var mongoose = require('mongoose');
const crypto = __importStar(require("crypto"));
const buffer_1 = require("buffer");
const models_1 = require("./models");
const models_2 = require("../perfil/models");
const MailCtrl_1 = require("../server/MailCtrl");
/**
 *
 * @param {Express} app
 */
const route = (app) => {
    /**
     *  Listamos todos los usuarios en el backend.  Esto es solo a fines de la demo
     *  Ademas nos servira para el desarrollo de los otros tickets.
     */
    app.get("/users/", middleware_1.auth, middleware_1.admin, (0, run_1.run)(async (req, resp) => {
        //NOTA: tengan cuidado de no olvidar el await. Si omitimos el await
        // la respuesta de backend sería un objeto Promise sin resolver queç
        // se serializa como {}
        const users = await service.instance.getAllUsers();
        resp.json(users);
    }));
    app.get("/usersUA/", middleware_1.auth, middleware_1.admin, (0, run_1.run)(async (req, resp) => {
        //NOTA: tengan cuidado de no olvidar el await. Si omitimos el await
        // la respuesta de backend sería un objeto Promise sin resolver queç
        // se serializa como {}
        const users = await service.instance.getAllUsersUA();
        resp.json(users);
    }));
    app.get("/users/findByEmail/", validator.query("email").notEmpty().isEmail().withMessage(constants_1.ErrorCode.INVALID), (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        // retornar json de objeto User segun un id pasado 
        // ej : {"id" : "124", "name":  "Zahi" , "last_name": }
        const email = req.query.email;
        const users = await service.instance.findUserByEmail(email);
        resp.json(users);
    }));
    app.get("/user/findUserbyId/", (0, run_1.run)(async (req, resp) => {
        const id = req.query.id;
        const users = await service.instance.findUserById(id);
        resp.json(users);
    }));
    //buscar ssalas populares, busca las ultimas 5 creadas.
    //para mas/menos numeros cambiar limit(X)
    app.get("/user/findPopularsArtists/", middleware_1.auth, (0, run_1.run)(async (req, resp) => {
        // Buscar perfiles con el nombre especificado
        const perfil = await models_2.PerfilModel.findOne({ name: "Artista" });
        if (!perfil) {
            const artistasNo = [''];
            console.log(`Perfil con nombre Artista no encontrado.`);
            resp.json(artistasNo);
            return;
        }
        const perfilId = mongoose.Types.ObjectId(perfil._id);
        const artistas = await models_1.UserModel.find({ idPerfil: perfilId })
            .sort({ createdAt: -1 }) // Ordena por createdAt en orden descendente (los más recientes primero)
            .limit(5) // Limita los resultados a 5 documentos           
            .exec(); // Ejecuta la consulta
        console.log('ruta artistas populares: ', artistas);
        resp.json(artistas);
    }));
    app.put("/users/update/", middleware_1.auth, (0, middleware_1.checkPermission)(["EDITAR_PERFIL"]), validator.query("id").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const dto = req.body;
        const id = req.query.id;
        console.log('update user dto: ', dto);
        const userOriginal = await service.instance.findUserById(id);
        if (!dto["name"]) {
            dto["name"] = userOriginal["name"];
        }
        if (!dto["last_name"]) {
            dto["last_name"] = userOriginal["last_name"];
        }
        if (!dto["email"]) {
            dto["email"] = userOriginal["email"];
        }
        if (!dto["enabled"]) {
            dto["enabled"] = userOriginal["enabled"];
        }
        if (!dto["password"]) {
            dto["password"] = userOriginal["password"];
        }
        if (!dto["createdAt"]) {
            dto["createdAt"] = userOriginal["createdAt"];
        }
        if (!dto["idPerfil"]) {
            dto["idPerfil"] = userOriginal["idPerfil"];
        }
        if (!dto["idSalaDeEnsayo"]) {
            dto["idSalaDeEnsayo"] = userOriginal["idSalaDeEnsayo"];
        }
        if (!dto["createdAt"]) {
            dto["createdAt"] = userOriginal["createdAt"];
        }
        if (!dto["estadoUsuario"]) {
            dto["estadoUsuario"] = userOriginal["estadoUsuario"];
        }
        if (!dto["userType"]) {
            dto["userType"] = userOriginal["userType"];
        }
        if (!dto["tipoArtista"]) {
            dto["tipoArtista"] = userOriginal["tipoArtista"];
        }
        if (!dto["password"]) {
            dto["password"] = userOriginal["password"];
        }
        console.log(" ruta update user, baja:? ", dto["enabled"]);
        console.log('idPerfil: ', dto["idPerfil"]);
        const user = await service.instance.updateUser(id, {
            name: dto["name"],
            last_name: dto["last_name"],
            email: dto["email"],
            password: dto["password"],
            enabled: dto["enabled"],
            idPerfil: dto["idPerfil"],
            idArtistType: dto["idArtistType"],
            idArtistStyle: dto["idArtistStyle"],
            image_id: undefined,
            userType: dto["userType"],
            idSalaDeEnsayo: dto["idSalaDeEnsayo"],
            tipoArtista: dto['tipoArtista'],
            createdAt: dto["createdAt"]
        });
        resp.json(user);
    }));
    app.put("/users/changeUserState/", middleware_1.auth, 
    //checkPermission(["EDITAR_PERFIL"]),
    (0, middleware_1.checkPermission)(["EDITAR_PERFIL"]), validator.query("id").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const dto = req.body;
        const id = req.query.id;
        console.log('update user dto: ', dto);
        const userOriginal = await service.instance.findUserById(id);
        if (!dto["name"]) {
            dto["name"] = userOriginal["name"];
        }
        if (!dto["last_name"]) {
            dto["last_name"] = userOriginal["last_name"];
        }
        if (!dto["email"]) {
            dto["email"] = userOriginal["email"];
        }
        if (!dto["enabled"]) {
            dto["enabled"] = userOriginal["enabled"];
        }
        if (!dto["password"]) {
            dto["password"] = userOriginal["password"];
        }
        if (!dto["createdAt"]) {
            dto["createdAt"] = userOriginal["createdAt"];
        }
        if (!dto["idPerfil"]) {
            dto["idPerfil"] = userOriginal["idPerfil"];
        }
        if (!dto["idSalaDeEnsayo"]) {
            dto["idSalaDeEnsayo"] = userOriginal["idSalaDeEnsayo"];
        }
        if (!dto["createdAt"]) {
            dto["createdAt"] = userOriginal["createdAt"];
        }
        if (!dto["estadoUsuario"]) {
            dto["estadoUsuario"] = userOriginal["estadoUsuario"];
        }
        if (!dto["userType"]) {
            dto["userType"] = userOriginal["userType"];
        }
        if (!dto["tipoArtista"]) {
            dto["tipoArtista"] = userOriginal["tipoArtista"];
        }
        if (!dto["password"]) {
            dto["password"] = userOriginal["password"];
        }
        console.log(" ruta update user, baja:? ", dto["enabled"]);
        console.log('idPerfil: ', dto["idPerfil"]);
        const user = await service.instance.updateUserState(id, {
            name: dto["name"],
            last_name: dto["last_name"],
            email: dto["email"],
            password: dto["password"],
            enabled: dto["enabled"],
            idPerfil: dto["idPerfil"],
            idArtistType: dto["idArtistType"],
            idArtistStyle: dto["idArtistStyle"],
            image_id: undefined,
            userType: dto["userType"],
            idSalaDeEnsayo: dto["idSalaDeEnsayo"],
            tipoArtista: dto['tipoArtista'],
            createdAt: dto["createdAt"]
        });
        resp.json(user);
    }));
    app.put("/users/setAdmin/", async (req, res) => {
        const userId = req.query.id;
        try {
            const user = await models_1.UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            user.isAdmin = true;
            await user.save();
            res.status(200).json({ message: 'Usuario ahora es Admin' });
        }
        catch (error) {
            res.status(500).json({ error: 'Error al actualizar usuario' });
        }
    });
    app.put("/users/unsetAdmin/", async (req, res) => {
        const userId = req.query.id;
        try {
            const user = await models_1.UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            user.isAdmin = false;
            await user.save();
            res.status(200).json({ message: 'Usuario ahora no es Admin' });
        }
        catch (error) {
            res.status(500).json({ error: 'Error al actualizar usuario' });
        }
    });
    //Todo recibir contraseña vieja y nueva
    app.post("/users/updatePassword/", validator.query("id").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const dto = req.body;
        const id = req.query.id;
        const user = await service.instance.updatePassword(id, {
            name: dto["name"],
            last_name: dto["last_name"],
            email: dto["email"],
            password: dto["password"],
            image_id: undefined,
            idArtistType: dto["idArtistType"],
            idArtistStyle: dto["idArtistStyle"],
            idPerfil: dto["idPerfil"],
            enabled: dto["enabled"],
            userType: dto["userType"],
            idSalaDeEnsayo: dto["idSalaDeEnsayo"],
            tipoArtista: dto['tipoArtista']
        });
        resp.json(user);
    }));
    app.post("/users/", validator.body("name").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("last_name").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("password").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED)
        .isLength({ min: 8 }).withMessage(constants_1.ErrorCode.PASSWORD_TOO_SHORT), validator.body("email").isEmail().withMessage(constants_1.ErrorCode.INVALID), 
    //validator.body("userType").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    //validator.body("idPerfil").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const dto = req.body;
        console.log(dto.idPerfil);
        const user = await service.instance.createUser({
            name: dto["name"],
            last_name: dto["last_name"],
            email: dto["email"],
            password: dto["password"],
            idPerfil: dto["idPerfil"],
            idArtistType: dto["idArtistType"],
            idArtistStyle: dto["idArtistStyle"],
            image_id: undefined,
            enabled: dto["enabled"],
            userType: dto["userType"],
            idSalaDeEnsayo: dto["idSalaDeEnsayo"],
            tipoArtista: dto['tipoArtista']
        });
        const loginResponse = await service.instance.login(user.email, user.password);
        resp.json(loginResponse);
    }));
    app.post("/users2/", validator.body("name").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("last_name").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("password").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED)
        .isLength({ min: 8 }).withMessage(constants_1.ErrorCode.PASSWORD_TOO_SHORT), validator.body("email").isEmail().withMessage(constants_1.ErrorCode.INVALID), (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const dto = req.body;
        const user = await service.instance.createUser2({
            name: dto["name"],
            last_name: dto["last_name"],
            email: dto["email"],
            password: dto["password"],
            //  idPerfil: dto["idPerfil"],
            //  idArtistType: dto["idArtistType"],
            //  idArtistStyle: dto["idArtistStyle"],
            image_id: undefined
        });
        resp.json(user);
    }));
    app.post("/auth", validator.body("email").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("password").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        // https://dev.to/jahangeer/node-js-api-authentication-with-jwt-json-web-token-auth-middleware-ggm
        // autenticar a un usuario a partir de un email y password.
        // retornar jwt token para el usuario creado.
        console.log("email, password: ", req.body.email, req.body.password);
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const loginResponse = await service.instance.login(req.body.email, req.body.password);
        resp.json(loginResponse);
    }));
    app.get("/users/me", middleware_1.auth, (0, run_1.run)(async (req, resp) => {
        const logged = req.user;
        const user = await service.instance.findUserById(logged.id);
        resp.json(user);
    }));
    //recuperar contraseña
    app.post("/auth/create_token", 
    //checkPermission(['RECUPERAR_CONTRASEÑA']),
    (0, run_1.run)(async (req, resp) => {
        const tokenDto = await service.instance.resetPassword(req.body.email);
        resp.json(tokenDto);
    }));
    //recibir codigo para recuperar contraseña
    app.post("/auth/token", 
    //checkPermission(['RECUPERAR_CONTRASEÑA']),
    (0, run_1.run)(async (req, resp) => {
        //original:   
        //const tokenDto: LoginResponseDto = await service.instance.loginWithToken(req.body.email, req.body.token)
        //mia:
        const tokenDto = await service.instance.loginWithToken(req.body.email, req.body.token);
        resp.json(tokenDto);
    }));
    // reportes de usuario
    app.post("/users/reportesNuevosUsers", middleware_1.auth, middleware_1.admin, validator.body("fechaI").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("fechaH").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const dto = req.body;
        //fechaID = 'YYYY-MM-DD'
        console.log("ruta reporte nuevos usuarios");
        console.log(dto.fechaI);
        console.log(dto.fechaH);
        // const users : UserDto[] = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
        let dtoNewUsersReport = [];
        //dias = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
        //const NewUsersReport = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
        const NewUsersReport = await service.instance.obtenerCantidadDocumentosPorMes(dto.fechaI, dto.fechaH);
        const NewUsersReport2 = await service.instance.reporteNuevosUsuarios(dto.fechaI, dto.fechaH);
        resp.json(NewUsersReport2);
    }));
    app.post("/users/reportesNuevosArtistas/", middleware_1.auth, middleware_1.admin, validator.body("fechaI").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("fechaH").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const dto = req.body;
        console.log('dto fechas I y H: ', dto);
        //fechaID = 'YYYY-MM-DD'
        console.log("ruta reporte nuevos usuarios");
        console.log(dto.fechaI);
        console.log(dto.fechaH);
        // const users : UserDto[] = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
        let dtoNewUsersReport = [];
        //dias = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
        //const NewUsersReport = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
        const NewUsersReport = await service.instance.reporteNuevosArtistas(dto.fechaI, dto.fechaH);
        resp.json(NewUsersReport);
    }));
    app.post("/users/descargarReportesNuevosArtistas/", middleware_1.auth, middleware_1.admin, validator.body("fechaI").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("fechaH").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        try {
            const errors = validator.validationResult(req);
            if (errors && !errors.isEmpty()) {
                throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
            }
            const dto = req.body;
            console.log('dto fechas I y H: ', dto);
            //fechaID = 'YYYY-MM-DD'
            console.log("ruta reporte nuevos artistas");
            console.log(dto.fechaI);
            console.log(dto.fechaH);
            const fechaInicio = dto.fechaI;
            const fechaHasta = dto.fechaH;
            // const users : UserDto[] = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            let dtoNewUsersReport = [];
            //dias = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            //const NewUsersReport = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            const NewUsersReport = await service.instance.reporteNuevosArtistas(dto.fechaI, dto.fechaH);
            //Codigo Javascript :
            const chartImage = await (0, generateReportePdf_1.generateReporteBarChart)(NewUsersReport.labels, NewUsersReport.datasets[0].data, 'Artistas Nuevos'); // Generar el gráfico de barras
            //const chartImageBasic = await generateBarChart(mesesString, arrCantidades); // Generar el gráfico de barras
            const pdfBytes = await (0, generateReportePdf_1.generateReportePDF)(chartImage, 'Reporte - Artistas Nuevos', fechaInicio, fechaHasta); // Generar el PDF con el gráfico
            if (!pdfBytes || pdfBytes.length === 0) {
                throw new Error("El PDF no se generó o está vacío.");
            }
            // crear nombre de archivo irrepetible
            const currentDate = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '_');
            const fileName = `reporte_reservas_${currentDate}.pdf`;
            resp.setHeader('Content-Type', 'application/pdf');
            resp.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            resp.setHeader('Content-Length', pdfBytes.length);
            resp.end(buffer_1.Buffer.from(pdfBytes));
        }
        catch (error) {
            console.error('Error in PDF generation route:', error);
            resp.status(500).send({ error: 'Failed to generate PDF' });
        }
    }));
    //revisar, que cuente mejor los habilitados
    app.post("/users/reportesUsuariosActivos", middleware_1.auth, middleware_1.admin, validator.body("fechaI").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("fechaH").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const dto = req.body;
        //fechaID = 'YYYY-MM-DD'
        console.log("ruta reporte nuevos usuarios");
        console.log(dto.fechaI);
        console.log(dto.fechaH);
        // const users : UserDto[] = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
        let dtoNewUsersReport = [];
        //dias = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
        //const NewUsersReport = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
        const NewUsersReport = await service.instance.obtenerUsuariosActivosPorMes(dto.fechaI, dto.fechaH);
        resp.json(NewUsersReport);
    }));
    //descarga usuarios activos
    app.post("/users/descargarReportesUsuariosActivos", middleware_1.auth, middleware_1.admin, validator.body("fechaI").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("fechaH").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        try {
            const errors = validator.validationResult(req);
            if (errors && !errors.isEmpty()) {
                throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
            }
            const dto = req.body;
            //fechaID = 'YYYY-MM-DD'
            console.log("ruta reporte usuarios activos");
            console.log(dto.fechaI);
            console.log(dto.fechaH);
            const fechaInicio = dto.fechaI;
            const fechaHasta = dto.fechaH;
            // const users : UserDto[] = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            let dtoNewUsersReport = [];
            //dias = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            //const NewUsersReport = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            const NewUsersReport = await service.instance.obtenerUsuariosActivosPorMes(dto.fechaI, dto.fechaH);
            //Codigo Javascript :
            const chartImage = await (0, generateReportePdf_1.generateReporteBarChart)(NewUsersReport.labels, NewUsersReport.datasets[0].data, 'Usuarios Activos'); // Generar el gráfico de barras
            //const chartImageBasic = await generateBarChart(mesesString, arrCantidades); // Generar el gráfico de barras
            const pdfBytes = await (0, generateReportePdf_1.generateReportePDF)(chartImage, 'Reporte - Usuarios Activos', fechaInicio, fechaHasta); // Generar el PDF con el gráfico
            if (!pdfBytes || pdfBytes.length === 0) {
                throw new Error("El PDF no se generó o está vacío.");
            }
            // crear nombre de archivo irrepetible
            const currentDate = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '_');
            const fileName = `reporte_reservas_${currentDate}.pdf`;
            resp.setHeader('Content-Type', 'application/pdf');
            resp.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            resp.setHeader('Content-Length', pdfBytes.length);
            resp.end(buffer_1.Buffer.from(pdfBytes));
        }
        catch (error) {
            console.error('Error in PDF generation route:', error);
            resp.status(500).send({ error: 'Failed to generate PDF' });
        }
    }));
    app.post("/users/reportesUsuariosBaja", middleware_1.auth, middleware_1.admin, validator.body("fechaI").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("fechaH").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const dto = req.body;
        //fechaID = 'YYYY-MM-DD'
        console.log("ruta reporte nuevos usuarios");
        console.log(dto.fechaI);
        console.log(dto.fechaH);
        const NewUsersReport = await service.instance.obtenerUsuariosBajaPorMes(dto.fechaI, dto.fechaH);
        resp.json(NewUsersReport);
    }));
    //descaergar reporte usuarios baja
    app.post("/users/descargarReportesUsuariosBaja", middleware_1.auth, middleware_1.admin, validator.body("fechaI").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("fechaH").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        try {
            const errors = validator.validationResult(req);
            if (errors && !errors.isEmpty()) {
                throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
            }
            const dto = req.body;
            //fechaID = 'YYYY-MM-DD'
            console.log("ruta reporte nuevos usuarios");
            console.log(dto.fechaI);
            console.log(dto.fechaH);
            const NewUsersReport = await service.instance.obtenerUsuariosBajaPorMes(dto.fechaI, dto.fechaH);
            const fechaInicio = dto.fechaI;
            const fechaHasta = dto.fechaH;
            //Codigo Javascript :
            const chartImage = await (0, generateReportePdf_1.generateReporteBarChart)(NewUsersReport.labels, NewUsersReport.datasets[0].data, 'Usuarios Baja'); // Generar el gráfico de barras
            //const chartImageBasic = await generateBarChart(mesesString, arrCantidades); // Generar el gráfico de barras
            const pdfBytes = await (0, generateReportePdf_1.generateReportePDF)(chartImage, 'Reporte - Usuarios baja', fechaInicio, fechaHasta); // Generar el PDF con el gráfico
            if (!pdfBytes || pdfBytes.length === 0) {
                throw new Error("El PDF no se generó o está vacío.");
            }
            // crear nombre de archivo irrepetible
            const currentDate = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '_');
            // Enviar el archivo al cliente
            const fileName = `reporte_reservas_${currentDate}.pdf`;
            resp.setHeader('Content-Type', 'application/pdf');
            resp.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            resp.setHeader('Content-Length', pdfBytes.length);
            resp.end(buffer_1.Buffer.from(pdfBytes));
        }
        catch (error) {
            console.error('Error in PDF generation route:', error);
            resp.status(500).send({ error: 'Failed to generate PDF' });
        }
    }));
    //Reporte: contar cantidad de usuarios que alquilan sala de ensayo
    app.post("/users/reportesPropietariosAlquilan", middleware_1.auth, middleware_1.admin, validator.body("fechaI").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("fechaH").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const dto = req.body;
        //fechaID = 'YYYY-MM-DD'
        console.log("ruta reporte propietarios que alquilan");
        console.log(dto.fechaI);
        console.log(dto.fechaH);
        const NewUsersReport = await service.instance.propietariosAlquilanSala3(dto.fechaI, dto.fechaH);
        console.log('ruta descargar reporte prop alquilan, result: ', NewUsersReport);
        resp.json(NewUsersReport);
    }));
    //descargar reporte propietarios que alquilan
    app.post("/users/descargarReportesPropietariosAlquilan", middleware_1.auth, middleware_1.admin, validator.body("fechaI").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("fechaH").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        try {
            const errors = validator.validationResult(req);
            if (errors && !errors.isEmpty()) {
                throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
            }
            const dto = req.body;
            //fechaID = 'YYYY-MM-DD'
            console.log("ruta reporte propietarios que alquilan");
            console.log(dto.fechaI);
            console.log(dto.fechaH);
            const NewUsersReport = await service.instance.propietariosAlquilanSala3(dto.fechaI, dto.fechaH);
            console.log('ruta descargar reporte prop alquilan, result: ', NewUsersReport);
            if ('msg' in NewUsersReport) {
                // Manejar el caso en que no se encontraron usuarios
                console.log('ruta descargar reporte prop alquilan, mensaje:', NewUsersReport.msg);
                resp.status(404).json({ error: NewUsersReport.msg });
                return;
            }
            const fechaInicio = dto.fechaI;
            const fechaHasta = dto.fechaH;
            //Codigo Javascript :
            const chartImage = await (0, generateReportePdf_1.generateReporteBarChart)(NewUsersReport.labels, NewUsersReport.datasets[0].data, 'Usuarios Propietarios que alquilan sala'); // Generar el gráfico de barras
            //const chartImageBasic = await generateBarChart(mesesString, arrCantidades); // Generar el gráfico de barras
            const pdfBytes = await (0, generateReportePdf_1.generateReportePDF)(chartImage, 'Reporte - Usuarios Propietarios que alquilan sala', fechaInicio, fechaHasta); // Generar el PDF con el gráfico
            if (!pdfBytes || pdfBytes.length === 0) {
                throw new Error("El PDF no se generó o está vacío.");
            }
            // crear nombre de archivo irrepetible
            const currentDate = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '_');
            // Enviar el archivo al cliente
            const fileName = `reporte_reservas_${currentDate}.pdf`;
            resp.setHeader('Content-Type', 'application/pdf');
            resp.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            resp.setHeader('Content-Length', pdfBytes.length);
            resp.end(buffer_1.Buffer.from(pdfBytes));
        }
        catch (error) {
            console.error('Error in PDF generation route:', error);
            resp.status(500).send({ error: 'Failed to generate PDF' });
        }
    }));
    //Reporte: contar cantidad de usuarios que alquilan sala de ensayo con enlace de descarga pdf
    //No se usa, se usa el de arriba
    app.get("/users/reportesPropietariosAlquilanPdf", middleware_1.auth, middleware_1.admin, validator.body("fechaI").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("fechaH").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        try {
            const errors = validator.validationResult(req);
            if (errors && !errors.isEmpty()) {
                throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
            }
            const dto = req.body;
            //fechaID = 'YYYY-MM-DD'
            console.log("ruta reporte nuevos usuarios");
            console.log(dto.fechaI);
            console.log(dto.fechaH);
            const NewUsersReport = await service.instance.propietariosAlquilanSala(dto.fechaI, dto.fechaH);
            console.log('ruta:', NewUsersReport);
            //armar dos array uno con mes y otro con cantidad
            let arrMeses = [];
            let arrCantidades = [];
            NewUsersReport.forEach(item => {
                // meses esta designado con el nro de mes q le corresponde
                arrMeses.push(item.mes);
                arrCantidades.push(item.cantidad);
            });
            console.log('NewUsersReport:', NewUsersReport);
            //convierto array de numeros a array de string, que contiene los meses
            const mesesString = (0, mesesDiccionario_1.convertirMeses)(arrMeses);
            //Codigo Javascript :
            const chartImage = await (0, generatePdf_1.generateBarChartExample)(mesesString, arrCantidades); // Generar el gráfico de barras
            //const chartImageBasic = await generateBarChart(mesesString, arrCantidades); // Generar el gráfico de barras
            const pdfBytes = await (0, generatePdf_1.generatePDF)(chartImage); // Generar el PDF con el gráfico
            if (!pdfBytes || pdfBytes.length === 0) {
                throw new Error("El PDF no se generó o está vacío.");
            }
            // crear nombre de archivo irrepetible
            const currentDate = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '_');
            // Enviar el archivo al cliente
            const fileName = `reporte_reservas_${currentDate}.pdf`;
            resp.setHeader('Content-Type', 'application/pdf');
            resp.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            resp.setHeader('Content-Length', pdfBytes.length);
            resp.end(buffer_1.Buffer.from(pdfBytes));
        }
        catch (error) {
            console.error('Error in PDF generation route:', error);
            resp.status(500).send({ error: 'Failed to generate PDF' });
        }
    }));
    //TODO Promedio estrellas de artista
    app.get("/artistaPromedio/", (0, run_1.run)(async (req, res) => {
        //idArtista
        const id = req.query.id;
        const idArtist = mongoose.Types.ObjectId(id);
        //forma 3;
        // Buscar todas las opiniones para el artista
        const opiniones = await model_1.OpinionModel.find({ idArtist: idArtist });
        console.log('opiniones al artista: ', opiniones);
        if (opiniones.length === 0) {
            return res.json(0); // Si no hay opiniones para ese artista
        }
        // Calcular el promedio de estrellas
        const totalEstrellas = opiniones.reduce((acc, opinion) => acc + opinion.estrellas, 0);
        const promedioEstrellas = totalEstrellas / opiniones.length;
        console.log('promedio de estrellas de artista: ', promedioEstrellas);
        res.json(promedioEstrellas);
    }));
    app.post("/users/descargarReportesNuevosUsers", middleware_1.auth, middleware_1.admin, validator.body("fechaI").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("fechaH").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const { fechaI: fechaInicio, fechaH: fechaHasta } = req.body;
        console.log("📥 Generando reporte nuevos usuarios desde:", fechaInicio, "hasta:", fechaHasta);
        // Obtener los datos para el gráfico
        const NewUsersReport2 = await service.instance.reporteNuevosUsuarios(fechaInicio, fechaHasta);
        const chartImage = await (0, generateReportePdf_1.generateReporteBarChart)(NewUsersReport2.labels, NewUsersReport2.datasets[0].data, 'Usuarios Nuevos');
        const pdfBytes = await (0, generateReportePdf_1.generateReportePDF)(chartImage, 'Reporte - Usuarios Nuevos', fechaInicio, fechaHasta);
        // Configurar headers para descarga
        const nombreArchivo = `reporte_usuarios_nuevos_${Date.now()}.pdf`;
        resp.setHeader('Content-Type', 'application/pdf');
        resp.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
        console.log(buffer_1.Buffer.isBuffer(pdfBytes)); // true
        resp.write(pdfBytes); // sin Buffer.from
        resp.end();
    }));
    //---------------------------------- Enviar Enlace olvide mi coontraseña--------------------------------------
    //version vieja
    // app.post("/user/forgot-password", 
    //     run(async (req, res) => {
    //         const { email } = req.body;
    //         console.log('user/forgot-password- email:', email)
    //         const user = await UserModel.findOne({ email });
    //         console.log('usuario encontrado: ', user)
    //         if (!user) return res.status(400).json({ message: "Usuario no encontrado" });
    //         // Generar token y expiración
    //         const token = crypto.randomBytes(32).toString("hex");
    //         user.resetPasswordToken = token;
    //         user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora
    //         await user.save();
    //         // Enlace de recuperación
    //         const resetLink = `http://localhost:19006/reset-password/${token}`;
    //         //await sendEmail(email, "Recuperación de contraseña", `Haz click en el siguiente enlace para restablecer tu contraseña: ${resetLink}`);
    //         await sendEmailAsync({
    //             to:email, 
    //             subject: "Recuperación de contraseña", 
    //             text:  `Haz click en el siguiente enlace para restablecer tu contraseña: ${resetLink}`})
    //         res.json({ message: "Revisa tu correo para restablecer tu contraseña",
    //             resetLink:' http://localhost:19006/reset-password/',
    //             token: token
    //          });
    //     })
    // );
    //nueva versionGEMINI:
    app.post("/user/forgot-password", (0, run_1.run)(async (req, res) => {
        const { email } = req.body;
        console.log('user/forgot-password - email:', email);
        const user = await models_1.UserModel.findOne({ email });
        console.log('usuario encontrado:', user);
        if (!user) {
            return res.status(404).json({ message: "No existe una cuenta con este correo electrónico." });
        }
        // Generar token y expiración
        const token = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = token;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora
        try {
            await user.save();
            // Enlace de recuperación
            const resetLink = `http://localhost:5173/reset-password/${token}`;
            try {
                await (0, MailCtrl_1.sendEmailAsync)({
                    to: email,
                    subject: "Recuperación de contraseña",
                    text: `Haz click en el siguiente enlace para restablecer tu contraseña: ${resetLink}`
                });
                res.status(200).json({ message: "Se ha enviado un enlace de recuperación a tu correo electrónico.", estatus: 200, token: token });
            }
            catch (error) {
                console.error("Error al enviar el correo electrónico:", error);
                // Considera revertir el guardado del token si el envío de correo falla
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                await user.save();
                return res.status(500).json({ message: "Ocurrió un error al enviar el correo de recuperación.", estatus: 500 });
            }
        }
        catch (error) {
            console.error("Error al guardar el token de recuperación:", error);
            return res.status(500).json({ message: "Ocurrió un error interno al procesar la solicitud." });
        }
    }));
    //olvido su contraseña creacion de una nueva
    app.post("/reset-password/:token", async (req, res) => {
        const { token } = req.params;
        const { newPassword } = req.body;
        const user = await models_1.UserModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date(Date.now()) }
        });
        if (!user)
            return res.status(400).json({ message: "Token inválido o expirado" });
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        //logear usuario
        const loginResponse = await service.instance.login(user.email, user.password);
        res.json(loginResponse);
        //res.json({ message: "Contraseña actualizada correctamente" });
    });
};
exports.route = route;
