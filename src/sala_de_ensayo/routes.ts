import * as service from "./service"
import * as validator from "express-validator"
import { run } from "../common/utils/run";
import { Application, Request, Response } from "express";
import * as dao from "./dao"
import { OpinionDto, SalaDeEnsayoDto} from "./dto";
import {StringUtils} from "../common/utils/string_utils"
import {ArgumentsException} from "../common/exception/exception"
import {ErrorCode} from "../common/utils/constants"
import { Opinion, OpinionModel, SalaDeEnsayo, SalaDeEnsayoDoc, SalaDeEnsayoModel } from "./model";
import {ValidatorUtils} from "../common/utils/validator_utils"
import multer from "../common/utils/storage";
import  * as imageService from "../imagen/service"
import { admin, auth, checkArtistOrSalaDeEnsayo, checkPermission } from "../server/middleware";
import { UserDto } from "src/users/dto";
import * as userService from "../users/service"
import { PerfilModel } from "../perfil/models";
import { generateReporteBarChart, generateReportePDF, generateReportePieChart, generateReporteValoracionesPDF } from "../common/utils/generateReportePdf";
var mongoose = require('mongoose');
const fs = require('fs-extra');


/**
 * 
 * @param {express} app 
 */

export const route = (app: Application) => {

    app.get("/salasdeensayo/", run(async (req: Request, resp: Response) => {
        const salas : SalaDeEnsayoDto[] = await  service.instance.getAll()
       resp.json(salas)    
    }))

    app.get("/salasdeensayo/findOne/",
        auth,
        checkPermission(['CONSULTAR_SALA_DE_ENSAYO']),
        run(async (req:Request, resp: Response) => {
            const id = req.query.id as string
            const sala : SalaDeEnsayoDto = await service.instance.findSalaById(id);
            
            // const opinionesIds = sala.opiniones;
            // const opiniones = await OpinionModel.find({ _id: { $in: opinionesIds } });

            // const totalEstrellas = opiniones.reduce((total, opinion) => total + opinion.estrellas, 0);
            // const promedio = totalEstrellas / opiniones.length;
            // let salaResp={
            //     sala: sala,
            //     promedioEstrellas: promedio
            // }
            // if (opiniones.length === 0) {
            //     salaResp.promedioEstrellas = 0
            //   } else {
            //     salaResp.promedioEstrellas = promedio
            //   }
            // console.log(sala)
            
            resp.json(sala)
    }))
    
    //buscar ssalas populares, busca las ultimas 5 creadas.
    //para mas/menos numeros cambiar limit(X)
    app.get("/salasdeensayo/findPopulars/", 
        auth,
        run(async (req: Request, resp: Response) => {
        const salas: SalaDeEnsayoDoc[] = await SalaDeEnsayoModel.find()
        .sort({ createdAt: -1 }) // Ordena por createdAt en orden descendente (los más recientes primero)
        .limit(5)                 // Limita los resultados a 5 documentos
        .populate("idOwner")                 
        .exec();                  // Ejecuta la consulta
        console.log('ruta salas populares: ', salas)
        resp.json(salas)    
    }))
   
    //Buscar Sala de ensayo
    app.get("/salasdeensayo/findByName/",
        auth,
        checkPermission(['BUSCAR_SALA_DE_ENSAYO']),
        run(async (req: Request, resp: Response) => {
        const busqueda = req.query.q
        console.log('req.query.q: ', req.query.q)
        console.log(busqueda)
        const salas : SalaDeEnsayoDto[] = await service.instance.findByName(req.query.q as string)
        resp.json(salas)    
    }))
    

    //TODO findbyOwner
    app.get("/salasdeensayo/findByOwner/",
        auth, 
        run(async (req: Request, resp: Response) => {
            const id = req.query.id as string
            const salas : SalaDeEnsayoDto[] = await service.instance.findSalaByOwner(id)
            resp.json(salas)    
    }))


    //no se usa creo
    app.get("/salasdeensayo/search/",
        auth, 
        validator.body("idType").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("idLocality").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        run(async (req: Request, resp: Response) => {
            console.log("routes llega")
            const dto = req.body
            const salas : SalaDeEnsayoDto[] = await  service.instance.getSearch({        
                nameSalaEnsayo: dto["nameSalaDeEnsayo"],
                calleDireccion: dto["calleDireccion"],
                //numeroDireccion: dto["numeroDireccion"],
                //idLocality: dto["idLocality"],
                idType: dto["idType"],
                precioHora: dto["precioHora"],
                idOwner: dto["idOwner"],
                duracionTurno: dto["duracionTiempo"],
                descripcion: dto["descripcion"]
            })
        resp.json(salas)    
    }))
    

    //email cancelacion reaserva por artista
    app.post('/email/',
    auth,
    validator.body("receptor").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    validator.body("sala").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    validator.body("inicio").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        run(async (req: Request, resp: Response) => {
            const dto = req.body
            var Email = require('../server/MailCtrl');
            const mailOptions = {
                        from: 'proyectofinal2021mmaa@gmail.com',
                        to: dto["receptor"],
                        subject: "Cancelacion de la sala " + dto["sala"],
                        html:'<div id=":pf" class="a3s aiL "><table><tbody> <tr> <td style="padding:16px 24px"> <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%"> <tbody> <tr> <td> <table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="auto"> <tbody> <tr> <td> <img alt="Imagen de SoundRoom" border="0" height="70" width="70" src="https://fs-01.cyberdrop.to/SoundRoom_logo-X6fFVkX9.png" style="border-radius:50%;outline:none;color:#ffffff;max-width:unset!important;text-decoration:none" class="CToWUd"></a></td> </tr> </tbody> </table></td> </tr> <tr> <td> <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" align="center" style="max-width:396px;padding-bottom:4px;text-align:center"> <tbody> <tr> <td><h2 style="margin:0;color:#262626;font-weight:400;font-size:16px;line-height:1.5">'+"Usted acaba de cancelar su turno en la sala de ensayo " + dto["sala"] + " del dia " + dto["inicio"] + '</h2></td> </tr> </tbody> </table></td> </tr></tbody></table></div>',
                        text: "Usted acaba de cancelar su turno en la sala de ensayo " + dto["sala"] + " del dia " + dto["inicio"]
                };
            Email.sendEmail(mailOptions);
            resp.json("envio exitoso");
        })
    )

    //cancelacion reserva, aviso a dueño sala de ensayo
   app.post('/emailOwner/',
    auth,
    validator.body("receptor").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    validator.body("sala").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    validator.body("inicio").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    validator.body("nombreUsuario").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        run(async (req: Request, resp: Response) => {
            const dto = req.body
            var Email = require('../server/MailCtrl');
            const mailOptions = {
                     from: 'soundroomapp@gmail.com',
                     //from: process.env.EMAIL
                     to: dto["receptor"],
                     subject: "Cancelacion de la sala " + dto["sala"],
                     html:'<div id=":pf" class="a3s aiL "><table><tbody> <tr> <td style="padding:16px 24px"> <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%"> <tbody> <tr> <td> <table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="auto"> <tbody> <tr> <td> <img alt="Imagen de SoundRoom" border="0" height="70" width="70" src="https://fs-01.cyberdrop.to/SoundRoom_logo-X6fFVkX9.png" style="border-radius:50%;outline:none;color:#ffffff;max-width:unset!important;text-decoration:none" class="CToWUd"></a></td> </tr> </tbody> </table></td> </tr> <tr> <td> <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" align="center" style="max-width:396px;padding-bottom:4px;text-align:center"> <tbody> <tr> <td><h2 style="margin:0;color:#262626;font-weight:400;font-size:16px;line-height:1.5">'+"El usuario " + dto["nombreUsuario"] + " ha cancelado la reserva de la sala "+ dto["sala"] + " del dia " + dto["inicio"] + '</h2></td> </tr> </tbody> </table></td> </tr></tbody></table></div>',
                     text: "El usuario " + dto["nombreUsuario"] + " ha cancelado la reserva de la sala "+ dto["sala"] + " del dia " + dto["inicio"]
               };
            Email.sendEmail(mailOptions);
            resp.json("envio exitoso");
        })
    )

    app.post('/emailReserva/',
        auth,
        validator.body("receptorCliente").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("sala").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("inicio").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        run(async (req: Request, resp: Response) => {
            const dto = req.body
            var Email = require('../server/MailCtrl');
            const mailOptionsCliente = {
                from: 'proyectofinal2021mmaa@gmail.com',
                to: dto["receptorCliente"],
                subject: "Reserva de la sala " + dto["sala"],
                html: '<div id=":pf" class="a3s aiL "><table><tbody> <tr> <td style="padding:16px 24px"> <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%"> <tbody> <tr> <td> <table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="auto"> <tbody> <tr> <td> <img alt="Imagen de SoundRoom" border="0" height="70" width="70" src="https://fs-01.cyberdrop.to/SoundRoom_logo-X6fFVkX9.png" style="border-radius:50%;outline:none;color:#ffffff;max-width:unset!important;text-decoration:none" class="CToWUd"></a></td> </tr> </tbody> </table></td> </tr> <tr> <td> <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" align="center" style="max-width:396px;padding-bottom:4px;text-align:center"> <tbody> <tr> <td><h2 style="margin:0;color:#262626;font-weight:400;font-size:16px;line-height:1.5">' + "Usted acaba de realizar una reserva en la sala de ensayo " + dto["sala"] + " el dia " + dto["inicio"] + '</h2></td> </tr> </tbody> </table></td> </tr></tbody></table></div>',
                text: "Usted acaba de realizar una reserva en la sala de ensayo " + dto["sala"] + " el dia " + dto["inicio"]
            };
            Email.sendEmail(mailOptionsCliente);
            if (dto["receptorSala"]!= "") {
                const mailOptionsDueno = {
                    from: 'proyectofinal2021mmaa@gmail.com',
                    to: dto["receptorSala"],
                    subject: "Realizacion de reserva de la sala " + dto["sala"],
                    html: '<div id=":pf" class="a3s aiL "><table><tbody> <tr> <td style="padding:16px 24px"> <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%"> <tbody> <tr> <td> <table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="auto"> <tbody> <tr> <td> <img alt="Imagen de SoundRoom" border="0" height="70" width="70" src="https://fs-01.cyberdrop.to/SoundRoom_logo-X6fFVkX9.png" style="border-radius:50%;outline:none;color:#ffffff;max-width:unset!important;text-decoration:none" class="CToWUd"></a></td> </tr> </tbody> </table></td> </tr> <tr> <td> <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" align="center" style="max-width:396px;padding-bottom:4px;text-align:center"> <tbody> <tr> <td><h2 style="margin:0;color:#262626;font-weight:400;font-size:16px;line-height:1.5">' + "Han realizado una reserva para su sala  " + dto["sala"] + " el dia " + dto["inicio"] + '</h2></td> </tr> </tbody> </table></td> </tr></tbody></table></div>',
                    text: "Han realizado una reserva para su sala  " + dto["sala"] + " el dia " + dto["inicio"]
                };
                Email.sendEmail(mailOptionsDueno);
            };
            
            resp.json("envio exitoso");
        })
    )

    app.post("/salasdeensayo/", 
    auth,
    checkPermission(["CREAR_SALA_DE_ENSAYO"]),
    validator.body("nameSalaDeEnsayo").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    validator.body("calleDireccion").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    // validator.body("numeroDireccion").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    //validator.body("duracionTiempo").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    validator.body("idType").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    validator.body("descripcion").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    validator.body("precioHora").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    //validator.body("idLocality").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        
        run(async ( req: any, resp: Response) =>{
            const errors = validator.validationResult(req)
            if(errors && !errors.isEmpty()){
                throw ValidatorUtils.toArgumentsException(errors.array())
            }
            const dto = req.body
            //obtener usuario logueado con:
            const logged : UserDto = req.user 
            const user: UserDto = await userService.instance.findUserById(logged.id)
            //console.log(user)
            //console.log(user.id)
            

            //create  sala de ensayo
            const sala = await service.instance.createSalaDeEnsayo({
                nameSalaEnsayo: dto["nameSalaDeEnsayo"],
                calleDireccion: dto["calleDireccion"],
                precioHora: dto["precioHora"],
                idType: dto["idType"],
                idOwner: user.id,
                duracionTurno: dto["duracionTurno"],
                descripcion: dto["descripcion"],
                comodidades: dto["comodidades"],
                enabled: dto["enabled"]
                //numeroDireccion: dto["numeroDireccion"],
                //idLocality: dto["idLocality"],
                
            })
            // Buscar el perfil "Sala de Ensayo"
            const perfil = await PerfilModel.findOne({ name: 'Sala de Ensayo' }).exec();
            let perfilid =''
            if(perfil){
            //const perfilid = new mongoose.Types.ObjectId(perfil._id);
            //si existe perfil de sala de ensayo se cambiara el perfil
             perfilid = perfil._id
            }else{
            //sino existe el perfil sde seguira con el perfil asignado anteriormente
             perfilid = user.idPerfil
            }

            //añadir sala creado al array idSalaDeEnsayo de User
            const idSala = sala.id
            const userUpdate = await userService.instance.updateAddSala(user.id, {
                name: user.name,
                last_name: user.last_name,
                email: user.email,
                password: user.password,
                idPerfil: perfilid,
                idArtistType: user.idArtistType,
                idArtistStyle: user.idArtistStyle,
                image_id: undefined,
                enabled: user.enabled,
                userType: user.userType,
                idSalaDeEnsayo: idSala,
                tipoArtista: user.tipoArtista
            })
            //si usuario es artista, cambiarlo a SdE
            console.log( 'ruta actualizar perfil de usuario',
                 user.name,
                 user.last_name,
                 user.email,
                 user.password,
                 perfilid,
                 user.idArtistType,
                 user.idArtistStyle,
                 user.userType,
                 idSala,
                 user.tipoArtista,
                 user.enabledHistory)
            if(userUpdate.isAdmin === false){
                console.log('is not admin, change idPerfil: isAdmin: ', userUpdate.isAdmin )
                //const userUpdatePerfil = 
                await userService.instance.updateUser(user.id, {
                    name: user.name,
                    last_name: user.last_name,
                    email: user.email,
                    password: user.password,
                    idPerfil: perfilid,
                    createdAt: user.createdAt,
                    idArtistType: user.idArtistType,
                    idArtistStyle: user.idArtistStyle,
                    image_id: undefined,
                    //enabled: user.enabled,
                    userType: user.userType,
                    idSalaDeEnsayo: idSala,
                    tipoArtista: user.tipoArtista,
                    enabledHistory: user.enabledHistory
                })
            }
            //resp.json( userUpdatePerfil)

           // copiar a perfil con usuario
            resp.json(sala)
        
          }
        ) 
    )  

    //endpint with 1 image
    app.post("/salasdeensayo_imagen/", multer.single('img'),
    auth,
    checkPermission(['CREAR_SALA_DE_ENSAYO']),
    validator.body("nameSalaDeEnsayo").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    validator.body("calleDireccion").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    validator.body("numeroDireccion").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    validator.body("precioHora").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    validator.body("idType").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    //validator.body("idLocality").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        
        run(async ( req: Request, resp: Response) =>{
            const errors = validator.validationResult(req)
            if(errors && !errors.isEmpty()){
                throw ValidatorUtils.toArgumentsException(errors.array())
            }
            const dto = req.body
            //guardo imagen
            const titulo = dto["titulo"]
            const descripcion = dto["descripcionImg"]
            const imageUrl = req.file?.path as string
            const newImagen = {
                titulo: titulo,
                descripcion: descripcion, 
                url: imageUrl
            };
            console.log("route image ", newImagen)
            const newurl = `${process.env.APP_HOST}:${process.env.APP_PORT}/public/${req.file?.filename}`
            console.log(newurl)
            console.log("image name: ", req.file?.filename);
            const imagen = await imageService.instance.createImagen(newImagen) 
            console.log("id imagen: ", imagen.id)
            //guardo sala de ensayo con el id de la imagen
            const sala = await service.instance.createSalaDeEnsayo({
                nameSalaEnsayo: dto["nameSalaDeEnsayo"],
                calleDireccion: dto["calleDireccion"],
                //numeroDireccion: dto["numeroDireccion"],
                //idLocality: dto["idLocality"],
                precioHora: dto["precioHora"],
                idImagen: imagen.id,
                idType: dto["idType"],
                idOwner: dto["idOwner"],
                duracionTurno: dto["duracionturno"],
                descripcion: dto["descripcion"],
                comodidades: dto["comodidades"]
            })
            resp.json(sala)
          }
        ) 
    )

    app.put("/salasdeensayo/update/", 
    auth,
    checkPermission(['EDITAR_SALA_DE_ENSAYO']),
    validator.query("id").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    run( async(req: any, resp: Response) => {
        const errors = validator.validationResult(req)
            if(errors && !errors.isEmpty()){
                throw ValidatorUtils.toArgumentsException(errors.array())
            }
            const dto = req.body
            const id = req.query.id as string
            const salaOriginal : SalaDeEnsayoDto = await service.instance.findSalaById(id)
            if(!dto["nameSalaEnsayo"]){
                dto["nameSalaEnsayo"] = salaOriginal["nameSalaEnsayo"];
            }
            if(!dto["calleDireccion"]){
                dto["calleDireccion"] = salaOriginal["calleDireccion"];
            }
            if(!dto["numeroDireccion"]){
                dto["numeroDireccion"] = salaOriginal["numeroDireccion"];
            }
            if(!dto["precioHora"]){
                dto["precioHora"] = salaOriginal["precioHora"];
            }
            if(!dto["duracionTurno"]){
                dto["duracionTurno"] = salaOriginal["duracionTurno"];
            }
            if(!dto["descripcion"]){
                dto["descripcion"] = salaOriginal["descripcion"];
            }
            if(!dto["comodidades"]){
                dto["comodidades"] = salaOriginal["comodidades"];
            }
            if(!dto["enabled"]){
                dto["enabled"] = salaOriginal["enabled"];
            }
            if(!dto["createdAt"]){
                dto["createdAt"] = salaOriginal["createdAt"];
            }
            console.log('ruta update sala: ', dto)
            const sala = await service.instance.updateSalaDeEnsayo(id,{
                nameSalaEnsayo: dto["nameSalaEnsayo"],
                calleDireccion: dto["calleDireccion"],
                numeroDireccion: dto["numeroDireccion"],
                duracionTurno: dto["duracionTurno"],
                precioHora: dto["precioHora"],
                comodidades: dto["comodidades"],
                descripcion: dto["descripcion"],
                enabled: dto["enabled"]
            })
            
            resp.json(sala)
        })
    )

    app.get("/salasdeensayo/deletefrombd/",
        auth,
        checkPermission(['EDITAR_SALA_DE_ENSAYO']),
        validator.query("id").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        run( async(req: Request, resp: Response) => {
            const errors = validator.validationResult(req)
                if(errors && !errors.isEmpty()){
                    throw ValidatorUtils.toArgumentsException(errors.array())
                }
                const id = req.query.id as string
                const saladeleted = await service.instance.borrarSalaBd(id)
                resp.json(saladeleted)
            })

    )

        
    app.post("/salasdeensayo/reportesNuevasSdE", 
        auth,
        admin,
        validator.body("fechaI").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("fechaH").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),        
        run(async (req: any, resp: Response) => {
            const errors = validator.validationResult(req)
            if(errors && !errors.isEmpty()){
                throw ValidatorUtils.toArgumentsException(errors.array())
            }
            const dto = req.body 
            //fechaID = 'YYYY-MM-DD'
            console.log("ruta reporte nuevos usuarios")
            console.log(dto.fechaI)
            console.log(dto.fechaH)
            // const users : UserDto[] = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            let dtoNewUsersReport = [] 
            //dias = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            //const NewUsersReport = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            const NewUsersReport = await  service.instance.reporteNuevasSdE(dto.fechaI, dto.fechaH)
            
        resp.json(NewUsersReport)    
        })
    )

    //descargar reporte nuevas salas de ensayo:
    app.post("/salasdeensayo/descargarReportesNuevasSdE", 
        auth,
        admin,
        validator.body("fechaI").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("fechaH").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),        
        run(async (req: any, resp: Response) => {
            const errors = validator.validationResult(req)
            if(errors && !errors.isEmpty()){
                throw ValidatorUtils.toArgumentsException(errors.array())
            }
            const dto = req.body 
            //fechaID = 'YYYY-MM-DD'
            console.log("ruta reporte nuevos usuarios")
            console.log(dto.fechaI)
            console.log(dto.fechaH)
            // const users : UserDto[] = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            let dtoNewUsersReport = [] 
            //dias = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            //const NewUsersReport = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            const NewUsersReport = await  service.instance.reporteNuevasSdE(dto.fechaI, dto.fechaH)
            
            const fechaInicio =  dto.fechaI
            const fechaHasta =  dto.fechaH

            //Codigo Javascript :
            const chartImage = await generateReporteBarChart(NewUsersReport.labels, NewUsersReport.datasets[0].data, 'Salas de Ensayo Nuevas'); // Generar el gráfico de barras
            //const chartImageBasic = await generateBarChart(mesesString, arrCantidades); // Generar el gráfico de barras
            const pdfBytes = await generateReportePDF(chartImage, 'Reporte - Salas de Ensayo Nuevas', fechaInicio, fechaHasta); // Generar el PDF con el gráfico

            // crear nombre de archivo irrepetible
            const currentDate = new Date().toISOString().replace(/:/g, '-');
            const currentDatee = new Date()
            const currenDay = currentDatee.getDay()
            const currenMonth = currentDatee.getMonth()
            const currenYear = currentDatee.getFullYear()
            const currenHour = currentDatee.getTime()

            const rutaPdf = `report_${currentDate}.pdf`
            const rutaPdf2 = `report_${currenDay}${currenMonth}${currenYear}${currenHour}${currenHour}.pdf`

            // Guardar el archivo PDF en el servidor
            const ruta = `C:/Users/manzu/Desktop/soundroom_final/pdf_soundroom/pdfs/${rutaPdf2}`
            await fs.writeFile(`C:/Users/manzu/Desktop/soundroom_final/pdf_soundroom/pdfs/${rutaPdf2}`, pdfBytes);

            // Enviar el archivo al cliente
            resp.setHeader('Content-Disposition', `attachment; filename="${rutaPdf2}"`);
            resp.setHeader('Content-Type', 'application/pdf');
            resp.download(
                ruta, rutaPdf2, (err) => {
                    if (err) {
                        console.error('Error al enviar el archivo:', err);
                        resp.status(500).send('Error al descargar el archivo');
                    }
                }
            )   
        })
    )

    app.post("/salasdeensayo/createOpinion/",
        auth,
        checkPermission(['CALIFICAR_SALA_DE_ENSAYO']),
        //validator.query("idRoom").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("descripcion").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("estrellas").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("idRoom").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        run( async(req: any, resp: Response) => {
            const errors = validator.validationResult(req)
            if(errors && !errors.isEmpty()){
                throw ValidatorUtils.toArgumentsException(errors.array())
            }
            const dto = req.body
            const idRoom = req.query.idRoom as string
            console.log('ruta create opinion idRoom: ', idRoom)
            console.log('ruta create opinion, idUser: ', req.user.id)

            //obtener usuario logueado con:
            const logged : UserDto = req.user 
            const user: UserDto = await userService.instance.findUserById(logged.id)
            //create opinion
            const opinion = await service.instance.createOpinion({
                descripcion: dto["descripcion"],
                estrellas: dto["estrellas"] ,
                idUser: user.id,
                idRoom: dto["idRoom"],
                //idArtist: '',
            })
            console.log('Ruta, opinion creada: ', opinion)
            if(!opinion){
                resp.json("No se pude crear la opinon, intentalo de nuevo mas tarde")
            }
            const salaOriginal : SalaDeEnsayoDto = await service.instance.findSalaById(idRoom);
            console.log('ruta sala encontrada original', salaOriginal)   
            
            //update sala con la opinion
            console.log('ruta opinion: ',opinion)
            let sala = await service.instance.updateSalaDeEnsayoOpinion(idRoom,{
                nameSalaEnsayo: salaOriginal["nameSalaEnsayo"],
                calleDireccion: salaOriginal["calleDireccion"],
                numeroDireccion: salaOriginal["numeroDireccion"],
                precioHora: salaOriginal["precioHora"],
                opiniones: opinion.id
            })
            // realizar calculos de promedio luego de crear la opinion
            const salaUpdated : SalaDeEnsayoDto = await service.instance.findSalaById(idRoom);
            const opinionesIds = salaUpdated.opiniones;
            const opiniones = await OpinionModel.find({ _id: { $in: opinionesIds } });

            const totalEstrellas = opiniones.reduce((total, opinion) => total + opinion.estrellas, 0);
            const promedio = totalEstrellas / opiniones.length;
            const nameSala = salaOriginal.nameSalaEnsayo
            console.log('ruta, sala actualizada con opinion', salaOriginal)
            console.log('nombre de sala', nameSala)
            let salaResp={
                sala: salaUpdated,
                promedioEstrellas: promedio
            }
            resp.json(salaResp)

        
        })
    )

    app.post("/salasdeensayo/createOpinionToArtist/",
        auth,
        checkPermission(['CALIFICAR_ARTISTA']),
        //validator.query("idRoom").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("descripcion").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("estrellas").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("idArtist").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        run( async(req: any, resp: Response) => {
            const errors = validator.validationResult(req)
            if(errors && !errors.isEmpty()){
                throw ValidatorUtils.toArgumentsException(errors.array())
            }
            const dto = req.body
            const idArtist = req.query.idArtist as string
            console.log('ruta create Opinion idArtist: ', dto['idArtist'])
            console.log('ruta create opinion, idUser: ', req.user.id)

            //obtener usuario logueado con:
            const logged : UserDto = req.user 
            const user: UserDto = await userService.instance.findUserById(logged.id)
            //create opinion
            const opinion = await service.instance.createOpinionArtist({
                descripcion: dto["descripcion"],
                estrellas: dto["estrellas"] ,
                //usuario loguado hace opinion- propietario de SdE
                idUser: user.id,
                //Artista a quien le hace la opinion
                idArtist: dto['idArtist'],
            })
            console.log('Ruta, opinion creada: ', opinion)
            if(!opinion){
                resp.json("No se pude crear la opinon, intentalo de nuevo mas tarde")
            }
            
            resp.json(opinion)

        
        })
    )

    //TODO update opinion
    app.put("/saladeensayo/updateOpinion/",
        auth,
        checkPermission(['CALIFICAR_SALA_DE_ENSAYO']),
        validator.query("id").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        run(async (req: any, resp: Response) =>{
            const errors = validator.validationResult(req)
                if(errors && !errors.isEmpty()){
                    throw ValidatorUtils.toArgumentsException(errors.array())
                }
            const dto = req.body
            const id = req.query.id as string
            console.log("ruta update Opinion: ", dto)
            const opinionOriginal: OpinionDto = await service.instance.getOpinionById(id)
            if(!dto["descripcion"]){
                dto["descripcion"] = opinionOriginal["descripcion"];
            }
            if(!dto["estrellas"]){
                dto["estrellas"] = opinionOriginal["estrellas"];
            }
            if(!dto["idUser"]){
                dto["idUser"] = req.user.id
            }
            if(!dto["idRoom"]){
                dto["idRoom"] = opinionOriginal["idRoom"]
            }
        
            const opinionUpdate = await service.instance.updateOpinion(id,{
                descripcion:dto["descripcion"],
                estrellas:dto["estrellas"],
                idUser:dto["idUser"],
                idRoom: dto["idRoom"],
                //idArtist: '',
            })
        resp.json(opinionUpdate)
    }))

    app.put("/saladeensayo/updateOpinionToArtist/",
        auth,
        checkPermission(['ACTUALIZAR_CALIFICACION_ARTISTA']),
        validator.query("id").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        run(async (req: any, resp: Response) =>{
            const errors = validator.validationResult(req)
                if(errors && !errors.isEmpty()){
                    throw ValidatorUtils.toArgumentsException(errors.array())
                }
            const dto = req.body
            const id = req.query.id as string
            console.log("ruta update Opinion: ", dto)
            
            const opinionUpdate = await service.instance.updateOpinion(id,{
                descripcion:dto["descripcion"],
                estrellas:dto["estrellas"],
                idUser:req.user.id,
                idRoom: '',
                idArtist: dto["idArtist"],
            })
            resp.json(opinionUpdate)
        }))

    app.get("/salaPromedio/", 
        auth,
        run( async(req: Request, res: Response)=>{
        const id = req.query.id as string
        const salaDeEnsayo:SalaDeEnsayoDto = await service.instance.findSalaById(id);

        const opinionesIds = salaDeEnsayo.opiniones;
        const opiniones = await OpinionModel.find({ _id: { $in: opinionesIds } });

        const totalEstrellas = opiniones.reduce((total, opinion) => total + opinion.estrellas, 0);
        const promedio = totalEstrellas / opiniones.length;

        //retorna solo el numero, ej: 3.5
        res.json(promedio)

    }) )


    //get opiniones de sala que se pasa por id en la query
    app.get("/salaOpiniones/",
        auth,
        checkArtistOrSalaDeEnsayo,
        run(async (req: Request, res: Response)=>{
        const id = req.query.id as string
        //buscar sala de ensayo
        const salaDeEnsayo = await service.instance.findSalaById(id);
        if (!salaDeEnsayo) {
            return res.status(404).json({ message: 'Sala de ensayo no encontrada' });
        }
        const opinionesIds = salaDeEnsayo.opiniones;
        const opiniones = await OpinionModel.find({ _id: { $in: opinionesIds } }).populate("idUser");

        res.json({ opiniones });

    }))

    app.get("/salaOpinionesdos/",
        auth,
        run(async (req: Request, res: Response)=>{
        const id = req.query.id as string
        //buscar sala de ensayo
        // idType: mongoose.Types.ObjectId(sala.idType)
        const opiniones: OpinionDto[] = await OpinionModel.find({ idRoom: id }).populate("idUser").exec();

        res.json(opiniones);

    }))

    //get opinion hecha por usuario logueado artista,  get mi opinion sobre una sala e particular
    app.get("/salaOpinion/getMyOpinionToRoom/", 
    auth, 
    checkArtistOrSalaDeEnsayo,
    validator.query("idRoom").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    run(async (req: any, resp: Response)=>{
        console.log('route getting opinion to room')
        const errors = validator.validationResult(req)
        if(errors && !errors.isEmpty()){
            throw ValidatorUtils.toArgumentsException(errors.array())
        }
        //const idUser = req.query.id as string
        const idUser = req.user.id
        const dto = req.body
        const idRoom = req.query.idRoom
        console.log('ruta get my opinion to room:')
        console.log('idUser: ', idUser)
        console.log('idRoom: ', idRoom)
        //const opinion = await service.instance
        const opinion = await service.instance.getOpinionByUserAndRoom(idUser, idRoom)
        console.log('route response opinion to room: ', opinion)
        resp.json(opinion)

    })
    )


    
     //get opinion hecha por usuario logueado SdE,  get mi opinion sobre una artista en particular
     app.get("/salaOpinion/", 
        auth, 
        validator.query("idArtist").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        run(async (req: any, resp: Response)=>{
            console.log('route getting opinion to room')
            const errors = validator.validationResult(req)
            if(errors && !errors.isEmpty()){
                throw ValidatorUtils.toArgumentsException(errors.array())
            }
            //const idUser = req.query.id as string
            const idUser = req.user.id
            const dto = req.body
            const idArtist = req.query.idArtist
            console.log('ruta get my opinion to room:')
            console.log('idUser: ', idUser)
            console.log('idArtist: ', idArtist)
            //const opinion = await service.instance
            const opinion = await service.instance.getOpinionByUserAndArtist(idUser, idArtist)
            console.log('route response opinion to room: ', opinion)
            resp.json(opinion)
    
        })
        )

    //TODO get opinones sobre un artista
    app.get("/opinionToArtista/",
        auth,
        run(async (req: Request,resp: Response) => {
            console.log('ruta opinionToArtista')
            const id = req.query.id as string
            const opiniones : OpinionDto [] = await  service.instance.getOpinionToArtist(id)
            resp.json(opiniones) 
         })
    )


    interface GrafTortaTipoSala {
        name: string;
        population: number;
    }
    interface GrafTortaTipoSala2 {
        labels: string;
        population: number;
    }

    app.post("/salasDeEnsayo/reporteTipoSalaTorta",
        auth,
        admin,
        validator.body("fechaI").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("fechaH").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        run(async (req: Request, resp: Response) => {
          const errors = validator.validationResult(req);
          if (errors && !errors.isEmpty()) {
            throw ValidatorUtils.toArgumentsException(errors.array());
          }
      
          const dto = req.body;
          console.log("ruta reporte tipo sala de ensayo");
          console.log(dto.fechaI);
          console.log(dto.fechaH);
      
          const fechaInicioObj = new Date(dto.fechaI);
          const fechaFinObj = new Date(dto.fechaH);
      
          async function obtenerGrafTortaTipoSala(fechaInicio: Date, fechaFin: Date): Promise<GrafTortaTipoSala[]> {
            try {
              const resultados = await SalaDeEnsayoModel.aggregate([
                {
                  $match: {
                    createdAt: { $gte: fechaInicio, $lte: fechaFin },
                    deletedAt: { $exists: false }
                  }
                },
                {
                  $group: {
                    _id: "$idType",
                    count: { $sum: 1 }
                  }
                },
                {
                  $lookup: {
                    from: "types", // Nombre de la colección de tipos en MongoDB
                    localField: "_id",
                    foreignField: "_id",
                    as: "typeInfo"
                  }
                },
                {
                  $unwind: "$typeInfo"
                },
                {
                  $project: {
                    _id: 0,
                    name: "$typeInfo.name",
                    population: "$count"
                  }
                }
              ]);
      
              return resultados as GrafTortaTipoSala[];
            } catch (error) {
              console.error("Error al obtener el gráfico de torta por tipo de sala:", error);
              throw error;
            }
          }
      
          try {
            const resultados = await obtenerGrafTortaTipoSala(fechaInicioObj, fechaFinObj);
            console.log('resultados tipo Torta: ', resultados)
            return resp.status(200).json(resultados);
          } catch (error) {
            return resp.status(500).json({ error: "Error al generar el reporte" });
          }
        })
    );

    //reporte tipos de sala grafico torta:
    app.post("/salasDeEnsayo/descargarReporteTipoSalaTorta",
        auth,
        admin,
        validator.body("fechaI").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("fechaH").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        run(async (req: Request, resp: Response) => {
          const errors = validator.validationResult(req);
          if (errors && !errors.isEmpty()) {
            throw ValidatorUtils.toArgumentsException(errors.array());
          }
      
          const dto = req.body;
          console.log("ruta reporte tipo sala de ensayo");
          console.log(dto.fechaI);
          console.log(dto.fechaH);
      
          const fechaInicioObj = new Date(dto.fechaI);
          const fechaFinObj = new Date(dto.fechaH);
      
          async function obtenerGrafTortaTipoSala(fechaInicio: Date, fechaFin: Date): Promise<GrafTortaTipoSala[]> {
            try {
              const resultados = await SalaDeEnsayoModel.aggregate([
                {
                  $match: {
                    createdAt: { $gte: fechaInicio, $lte: fechaFin },
                    deletedAt: { $exists: false }
                  }
                },
                {
                  $group: {
                    _id: "$idType",
                    count: { $sum: 1 }
                  }
                },
                {
                  $lookup: {
                    from: "types", // Nombre de la colección de tipos en MongoDB
                    localField: "_id",
                    foreignField: "_id",
                    as: "typeInfo"
                  }
                },
                {
                  $unwind: "$typeInfo"
                },
                {
                  $project: {
                    _id: 0,
                    name: "$typeInfo.name",
                    population: "$count"
                  }
                }
              ]);



      
              return resultados as GrafTortaTipoSala[];
            } catch (error) {
              console.error("Error al obtener el gráfico de torta por tipo de sala:", error);
              throw error;
            }
          }
      
          try {
            const resultados = await obtenerGrafTortaTipoSala(fechaInicioObj, fechaFinObj);
            
            // Calcular el total de la población para calcular los porcentajes
            const totalPopulation = resultados.reduce((acc, result) => acc + result.population, 0);


            // Formatear los resultados para Chart.js
            const labels: string[] = resultados.map(result => {
                const percentage = ((result.population / totalPopulation) * 100).toFixed(2); // Calcular porcentaje
                return `${result.name} (${percentage}%)`; // Incluir porcentaje en el label
            });
            const data: number[] = resultados.map(result => result.population);

            const formattedResult = {
            labels: labels,
            datasets: [
                {
                data: data
                }
            ]
            };

            const fechaInicio =  dto.fechaI
            const fechaHasta =  dto.fechaH

            //Codigo Javascript :
            const chartImage = await generateReportePieChart(formattedResult.labels, formattedResult.datasets[0].data, ' Tipos de Salas de Ensayo'); // Generar el gráfico de barras
            //const chartImageBasic = await generateBarChart(mesesString, arrCantidades); // Generar el gráfico de barras
            const pdfBytes = await generateReportePDF(chartImage, 'Reporte - Tipos de Salas de Ensayo', fechaInicio, fechaHasta); // Generar el PDF con el gráfico

            // crear nombre de archivo irrepetible
            const currentDate = new Date().toISOString().replace(/:/g, '-');
            const currentDatee = new Date()
            const currenDay = currentDatee.getDay()
            const currenMonth = currentDatee.getMonth()
            const currenYear = currentDatee.getFullYear()
            const currenHour = currentDatee.getTime()

            const rutaPdf = `report_${currentDate}.pdf`
            const rutaPdf2 = `report_${currenDay}${currenMonth}${currenYear}${currenHour}${currenHour}.pdf`

            // Guardar el archivo PDF en el servidor
            const ruta = `C:/Users/manzu/Desktop/soundroom_final/pdf_soundroom/pdfs/${rutaPdf2}`
            await fs.writeFile(`C:/Users/manzu/Desktop/soundroom_final/pdf_soundroom/pdfs/${rutaPdf2}`, pdfBytes);

            // Enviar el archivo al cliente
            resp.setHeader('Content-Disposition', `attachment; filename="${rutaPdf2}"`);
            resp.setHeader('Content-Type', 'application/pdf');
            resp.download(
                ruta, rutaPdf2, (err) => {
                    if (err) {
                        console.error('Error al enviar el archivo:', err);
                        resp.status(500).send('Error al descargar el archivo');
                    }
                }
            )   

        
        
          } catch (error) {
            return resp.status(500).json({ error: "Error al generar el reporte" });
          }
        })
      );

   
      app.get("/salasdeensayo/cantidadVaoraciones/", 
      auth,
      run(async (req: any, resp: Response) => {
          const errors = validator.validationResult(req)
          if(errors && !errors.isEmpty()){
              throw ValidatorUtils.toArgumentsException(errors.array())
          }
          const dto = req.body 
          const id = req.query.idRoom as string
          
          console.log("ruta cantidad valoraciones")
        
          //dias = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
          //const NewUsersReport = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
          const NewUsersReport = await  service.instance.obtenerCantidadValoracionesDos(id)
          
      resp.json(NewUsersReport)    
      }))

    //descargar reporte cantidad valoraciones por sala:
    app.get("/salasdeensayo/descargarCantidadVaoraciones/", 
        auth,
        run(async (req: any, resp: Response) => {
            const errors = validator.validationResult(req)
            if(errors && !errors.isEmpty()){
                throw ValidatorUtils.toArgumentsException(errors.array())
            }
            const dto = req.body 
            const id = req.query.idRoom as string
            
            console.log("ruta cantidad valoraciones")
          
            //dias = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            //const NewUsersReport = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            const NewUsersReport = await  service.instance.obtenerCantidadValoracionesDos(id)
            
            //obtener sala de ensayo para tener su nombre:
            const sala = await service.instance.findSalaById(id)
            const salaNombre= sala.nameSalaEnsayo 

            const fechaInicio =  dto.fechaI
            const fechaHasta =  dto.fechaH
            console.log('Fechas Inicio y Fin')
            console.log('Fecha Inicio: ', fechaInicio)
            console.log('Fecha hasta: ', fechaHasta)

            //Codigo Javascript :
            const chartImage = await generateReporteBarChart(NewUsersReport.labels, NewUsersReport.datasets[0].data, 'Cantidad de valoraciones'); // Generar el gráfico de barras
            //const chartImageBasic = await generateBarChart(mesesString, arrCantidades); // Generar el gráfico de barras
            const pdfBytes = await generateReporteValoracionesPDF(chartImage, 'Reporte - Cantidad de valoraciones', salaNombre,  fechaInicio, fechaHasta ); // Generar el PDF con el gráfico

            // crear nombre de archivo irrepetible
            const currentDate = new Date().toISOString().replace(/:/g, '-');
            const currentDatee = new Date()
            const currenDay = currentDatee.getDay()
            const currenMonth = currentDatee.getMonth()
            const currenYear = currentDatee.getFullYear()
            const currenHour = currentDatee.getTime()

            const rutaPdf = `report_${currentDate}.pdf`
            const rutaPdf2 = `report_${currenDay}${currenMonth}${currenYear}${currenHour}${currenHour}.pdf`

            // Guardar el archivo PDF en el servidor
            const ruta = `C:/Users/manzu/Desktop/soundroom_final/pdf_soundroom/pdfs/${rutaPdf2}`
            await fs.writeFile(`C:/Users/manzu/Desktop/soundroom_final/pdf_soundroom/pdfs/${rutaPdf2}`, pdfBytes);

            // Enviar el archivo al cliente
            resp.setHeader('Content-Disposition', `attachment; filename="${rutaPdf2}"`);
            resp.setHeader('Content-Type', 'application/pdf');
            resp.download(
                ruta, rutaPdf2, (err) => {
                    if (err) {
                        console.error('Error al enviar el archivo:', err);
                        resp.status(500).send('Error al descargar el archivo');
                    }
                }
            )   
    }))

  




}