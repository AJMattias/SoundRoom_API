import * as service from "./service"
import * as validator from "express-validator"
import {run} from "../common/utils/run"
import {Application, Request, Response} from "express"
import {admin, auth, checkPermission} from "../server/middleware"
import {LoginResponseDto, LoginWithTokenDto, UserDto} from "./dto"
import {StringUtils} from "../common/utils/string_utils"
import {ArgumentsException, AuthorizationException} from "../common/exception/exception"
import {ErrorCode} from "../common/utils/constants"
import {ValidatorUtils} from "../common/utils/validator_utils"
import { dangerouslyDisableDefaultSrc } from "helmet/dist/middlewares/content-security-policy"
import { generateBarChartExample, generatePDF, generateBarChart  } from '../common/utils/generatePdf'
import { generateReporteBarChartExample, generateReportePDF, generateReporteBarChart  } from '../common/utils/generateReportePdf'
import { convertirMeses } from "../common/utils/mesesDiccionario"
import path from "path"
import { OpinionModel } from "../sala_de_ensayo/model"
import { OpinionDto } from "../sala_de_ensayo/dto"
import * as  salaService from "../sala_de_ensayo/service"
//import fs from 'fs';
const fs = require('fs-extra');
var mongoose = require('mongoose');
import * as crypto from "crypto";

//opinion service
import * as opinionService from "../sala_de_ensayo/service"
import { UserDoc, UserModel } from "./models"
import { PerfilModel } from "../perfil/models"
import { add } from "date-fns"
import { sendEmail, sendEmailAsync } from "../server/MailCtrl"

/**
 * 
 * @param {Express} app 
 */
export const route = (app: Application) => {
    /**
     *  Listamos todos los usuarios en el backend.  Esto es solo a fines de la demo
     *  Ademas nos servira para el desarrollo de los otros tickets.
     */
    app.get("/users/", 
        auth,
        admin,
        run(async (req: any, resp: Response) => {
        //NOTA: tengan cuidado de no olvidar el await. Si omitimos el await
        // la respuesta de backend sería un objeto Promise sin resolver queç
        // se serializa como {}
        const users : UserDto[] = await  service.instance.getAllUsers()
        resp.json(users)    
    }))

    app.get("/usersUA/", 
        auth,
        admin,
        run(async (req: any, resp: Response) => {
        //NOTA: tengan cuidado de no olvidar el await. Si omitimos el await
        // la respuesta de backend sería un objeto Promise sin resolver queç
        // se serializa como {}
        const users : UserDto[] = await  service.instance.getAllUsersUA()
        resp.json(users)    
    }))

    app.get("/users/findByEmail/", 
        validator.query("email").notEmpty().isEmail().withMessage(ErrorCode.INVALID),
        run(async (req: Request,resp: Response) => {  
            const errors = validator.validationResult(req)
            if(errors && !errors.isEmpty()){
                throw ValidatorUtils.toArgumentsException(errors.array())
            }
            
            // retornar json de objeto User segun un id pasado 
            // ej : {"id" : "124", "name":  "Zahi" , "last_name": }
            const email = req.query.email as string
            const users : UserDto = await  service.instance.findUserByEmail(email)
            resp.json(users) 
    }))
    app.get("/user/findUserbyId/",
        run(async (req: Request,resp: Response) => {
        const id = req.query.id as string
        const users : UserDto = await  service.instance.findUserById(id)
        resp.json(users) 
     }))

    //buscar ssalas populares, busca las ultimas 5 creadas.
    //para mas/menos numeros cambiar limit(X)
    app.get("/user/findPopularsArtists/", 
        auth,
        run(async (req: Request, resp: Response) => {
        // Buscar perfiles con el nombre especificado
        const perfil = await PerfilModel.findOne({ name: "Artista" });

        if (!perfil) {
            const artistasNo = ['']
            console.log(`Perfil con nombre Artista no encontrado.`);
            resp.json(artistasNo);
            return
        }
        const perfilId = mongoose.Types.ObjectId(perfil._id)
        const artistas: UserDoc[] = await UserModel.find({ idPerfil: perfilId})
        .sort({ createdAt: -1 }) // Ordena por createdAt en orden descendente (los más recientes primero)
        .limit(5)                 // Limita los resultados a 5 documentos           
        .exec();                  // Ejecuta la consulta
        console.log('ruta artistas populares: ', artistas)
        resp.json(artistas)    
    }))


     app.put("/users/update/",
        auth,
        checkPermission(["EDITAR_PERFIL"]),
        validator.query("id").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        run(async (req: Request,resp: Response) => {
            const errors = validator.validationResult(req)
            if(errors && !errors.isEmpty()){
                throw ValidatorUtils.toArgumentsException(errors.array())
            }
            const dto = req.body
            const id = req.query.id as string
            console.log('update user dto: ', dto)
            const userOriginal : UserDto = await  service.instance.findUserById(id)
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
            console.log(" ruta update user, baja:? ", dto["enabled"])
            console.log('idPerfil: ', dto["idPerfil"])
            const user = await service.instance.updateUser(id,{
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
            })
            resp.json(user)
        })
     )

     app.put("/users/changeUserState/",
        auth,
        checkPermission(["EDITAR_PERFIL"]),
        validator.query("id").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        run(async (req: Request,resp: Response) => {
            const errors = validator.validationResult(req)
            if(errors && !errors.isEmpty()){
                throw ValidatorUtils.toArgumentsException(errors.array())
            }
            const dto = req.body
            const id = req.query.id as string
            console.log('update user dto: ', dto)
            const userOriginal : UserDto = await  service.instance.findUserById(id)
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
            console.log(" ruta update user, baja:? ", dto["enabled"])
            console.log('idPerfil: ', dto["idPerfil"])
            const user = await service.instance.updateUserState(id,{
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
            })
            resp.json(user)
        })
     )

     app.put("/users/setAdmin/", async (req: Request, res: Response) => {
        const userId = req.query.id;
      
        try {
          const user = await UserModel.findById(userId);
          if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
          }
      
          user.isAdmin = true;
          await user.save();
          res.status(200).json({ message: 'Usuario ahora es Admin' });
        } catch (error) {
          res.status(500).json({ error: 'Error al actualizar usuario' });
        }
      });

      app.put("/users/unsetAdmin/", async (req: Request, res: Response) => {
        const userId = req.query.id;
      
        try {
          const user = await UserModel.findById(userId);
          if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
          }
      
          user.isAdmin = false;
          await user.save();
          res.status(200).json({ message: 'Usuario ahora no es Admin' });
        } catch (error) {
          res.status(500).json({ error: 'Error al actualizar usuario' });
        }
      });

     app.post("/users/updatePassword/",
        validator.query("id").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        run(async (req: Request,resp: Response) => {
            const errors = validator.validationResult(req)
            if(errors && !errors.isEmpty()){
                throw ValidatorUtils.toArgumentsException(errors.array())
            }

            const dto = req.body
            const id = req.query.id as string
            const user = await service.instance.updatePassword(id,{
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
            })
            resp.json(user)
     }))
     
     app.post("/users/", 
            validator.body("name").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
            validator.body("last_name").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
            validator.body("password").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED)
                    .isLength({min: 8}).withMessage(ErrorCode.PASSWORD_TOO_SHORT),
            validator.body("email").isEmail().withMessage(ErrorCode.INVALID),
            //validator.body("userType").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
            //validator.body("idPerfil").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),

            run(async (req: Request, resp: Response) =>{
                const errors = validator.validationResult(req)
                if(errors && !errors.isEmpty()){
                    throw ValidatorUtils.toArgumentsException(errors.array())
                }
                const dto = req.body
                console.log(dto.idPerfil)
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
                })
                const loginResponse = await service.instance.login(user.email, user.password)
                resp.json( loginResponse)    
             }
         )
     )
     app.post("/users2/", 
     validator.body("name").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
     validator.body("last_name").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
     validator.body("password").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED)
             .isLength({min: 8}).withMessage(ErrorCode.PASSWORD_TOO_SHORT),
     validator.body("email").isEmail().withMessage(ErrorCode.INVALID),
     run(async (req: Request, resp: Response) =>{
         const errors = validator.validationResult(req)
         if(errors && !errors.isEmpty()){
             throw ValidatorUtils.toArgumentsException(errors.array())
         }
         const dto = req.body
         const user = await service.instance.createUser2({
             name: dto["name"],
             last_name: dto["last_name"],
             email: dto["email"],
             password: dto["password"],
            //  idPerfil: dto["idPerfil"],
            //  idArtistType: dto["idArtistType"],
            //  idArtistStyle: dto["idArtistStyle"],
             image_id: undefined
         })
         resp.json(user)    
      }
  )
)
     app.post("/auth", 
        validator.body("email").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("password").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),        
        run(async (req: Request, resp: Response) => {
         // https://dev.to/jahangeer/node-js-api-authentication-with-jwt-json-web-token-auth-middleware-ggm
         // autenticar a un usuario a partir de un email y password.
         // retornar jwt token para el usuario creado.
         const errors = validator.validationResult(req)
          if(errors && !errors.isEmpty()){
            throw ValidatorUtils.toArgumentsException(errors.array())
         }
         const loginResponse = await service.instance.login(req.body.email, req.body.password)
         resp.json(loginResponse)
     }))

     app.get("/users/me",
        auth,
        run(async (req: any, resp : Response) => {
            const logged : UserDto = req.user 
            const user: UserDto = await service.instance.findUserById(logged.id)
            resp.json(user)
        })
     )

     //recuperar contraseña
     app.post("/auth/create_token", 
        //checkPermission(['RECUPERAR_CONTRASEÑA']),
        run(async(req: Request, resp: Response) => {
         const tokenDto: LoginWithTokenDto = await service.instance.resetPassword(req.body.email)
         resp.json(tokenDto)
     }))

    //recibir codigo para recuperar contraseña
     app.post("/auth/token",
        //checkPermission(['RECUPERAR_CONTRASEÑA']),
        run(async(req: Request, resp: Response) => {
         //original:   
        //const tokenDto: LoginResponseDto = await service.instance.loginWithToken(req.body.email, req.body.token)
        
        //mia:
        const tokenDto = await service.instance.loginWithToken(req.body.email, req.body.token)
        resp.json(tokenDto)
    }))


    // reportes de usuario

    app.post("/users/reportesNuevosUsers", 
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
            const NewUsersReport = await  service.instance.obtenerCantidadDocumentosPorMes(dto.fechaI, dto.fechaH)
            const NewUsersReport2 = await  service.instance.reporteNuevosUsuarios(dto.fechaI, dto.fechaH)
            
            resp.json(NewUsersReport2)    
    }))

    app.post("/users/reportesNuevosArtistas/", 
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
            console.log('dto fechas I y H: ', dto)
            //fechaID = 'YYYY-MM-DD'
            console.log("ruta reporte nuevos usuarios")
            console.log(dto.fechaI)
            console.log(dto.fechaH)
            // const users : UserDto[] = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            let dtoNewUsersReport = [] 
            //dias = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            //const NewUsersReport = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            const NewUsersReport = await  service.instance.reporteNuevosArtistas(dto.fechaI, dto.fechaH)
            
            resp.json(NewUsersReport)    
    }))

    app.post("/users/descargarReportesNuevosArtistas/", 
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
            console.log('dto fechas I y H: ', dto)
            //fechaID = 'YYYY-MM-DD'
            console.log("ruta reporte nuevos artistas")
            console.log(dto.fechaI)
            console.log(dto.fechaH)
            const fechaInicio =  dto.fechaI
            const fechaHasta =  dto.fechaH
            // const users : UserDto[] = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            let dtoNewUsersReport = [] 
            //dias = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            //const NewUsersReport = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            const NewUsersReport = await  service.instance.reporteNuevosArtistas(dto.fechaI, dto.fechaH)
            
            //Codigo Javascript :
            const chartImage = await generateReporteBarChart(NewUsersReport.labels, NewUsersReport.datasets[0].data, 'Artistas Nuevos'); // Generar el gráfico de barras
            //const chartImageBasic = await generateBarChart(mesesString, arrCantidades); // Generar el gráfico de barras
            const pdfBytes = await generateReportePDF(chartImage, 'Reporte - Artistas Nuevos', fechaInicio, fechaHasta); // Generar el PDF con el gráfico

            // crear nombre de archivo irrepetible
            const currentDate = new Date().toISOString().replace(/:/g, '-');
            const currentDatee = new Date()
            const currenDay = currentDatee.getDay()
            const currenMonth = currentDatee.getMonth()
            const currenYear = currentDatee.getFullYear()
            const currenHour = currentDatee.getTime()

            const rutaPdf = `report_${currentDate}.pdf`
            const rutaPdf2 = `report_${currenDay}${currenMonth}${currenYear}${currenHour}.pdf`

            // Guardar el archivo PDF en el servidor
            const ruta = `E:/Usuarios/matti/Escritorio/pdf_soundroom/pdfs/${rutaPdf2}`
            await fs.writeFile(`E:/Usuarios/matti/Escritorio/pdf_soundroom/pdfs/${rutaPdf2}`, pdfBytes);

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

    //revisar, que cuente mejor los habilitados
    app.post("/users/reportesUsuariosActivos", 
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
            const NewUsersReport = await  service.instance.obtenerUsuariosActivosPorMes(dto.fechaI, dto.fechaH)
            
            resp.json(NewUsersReport)    
    }))

    //descarga usuarios activos
    app.post("/users/descargarReportesUsuariosActivos", 
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
            console.log("ruta reporte usuarios activos")
            console.log(dto.fechaI)
            console.log(dto.fechaH)
            const fechaInicio =  dto.fechaI
            const fechaHasta =  dto.fechaH
            // const users : UserDto[] = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            let dtoNewUsersReport = [] 
            //dias = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            //const NewUsersReport = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            const NewUsersReport = await  service.instance.obtenerUsuariosActivosPorMes(dto.fechaI, dto.fechaH)
            
            //Codigo Javascript :
            const chartImage = await generateReporteBarChart(NewUsersReport.labels, NewUsersReport.datasets[0].data, 'Usuarios Activos'); // Generar el gráfico de barras
            //const chartImageBasic = await generateBarChart(mesesString, arrCantidades); // Generar el gráfico de barras
            const pdfBytes = await generateReportePDF(chartImage, 'Reporte - Usuarios Activos', fechaInicio, fechaHasta); // Generar el PDF con el gráfico

            // crear nombre de archivo irrepetible
            const currentDate = new Date().toISOString().replace(/:/g, '-');
            const currentDatee = new Date()
            const currenDay = currentDatee.getDay()
            const currenMonth = currentDatee.getMonth()
            const currenYear = currentDatee.getFullYear()
            const currenHour = currentDatee.getTime()

            const rutaPdf = `report_${currentDate}.pdf`
            const rutaPdf2 = `report_${currenDay}${currenMonth}${currenYear}${currenHour}.pdf`

            // Guardar el archivo PDF en el servidor
            const ruta = `E:/Usuarios/matti/Escritorio/pdf_soundroom/pdfs/${rutaPdf2}`
            await fs.writeFile(`E:/Usuarios/matti/Escritorio/pdf_soundroom/pdfs/${rutaPdf2}`, pdfBytes);

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

    app.post("/users/reportesUsuariosBaja", 
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
            
            const NewUsersReport = await  service.instance.obtenerUsuariosBajaPorMes(dto.fechaI, dto.fechaH)
            
            resp.json(NewUsersReport)    
    }))

    //descaergar reporte usuarios baja
    app.post("/users/descargarReportesUsuariosBaja", 
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
            
            
            const NewUsersReport = await  service.instance.obtenerUsuariosBajaPorMes(dto.fechaI, dto.fechaH)
            
            const fechaInicio =  dto.fechaI
            const fechaHasta =  dto.fechaH
            //Codigo Javascript :
            const chartImage = await generateReporteBarChart(NewUsersReport.labels, NewUsersReport.datasets[0].data, 'Usuarios Baja'); // Generar el gráfico de barras
            //const chartImageBasic = await generateBarChart(mesesString, arrCantidades); // Generar el gráfico de barras
            const pdfBytes = await generateReportePDF(chartImage, 'Reporte - Usuarios baja', fechaInicio, fechaHasta); // Generar el PDF con el gráfico

            // crear nombre de archivo irrepetible
            const currentDate = new Date().toISOString().replace(/:/g, '-');
            const currentDatee = new Date()
            const currenDay = currentDatee.getDay()
            const currenMonth = currentDatee.getMonth()
            const currenYear = currentDatee.getFullYear()
            const currenHour = currentDatee.getTime()

            const rutaPdf = `report_${currentDate}.pdf`
            const rutaPdf2 = `report_${currenDay}${currenMonth}${currenYear}${currenHour}.pdf`

            // Guardar el archivo PDF en el servidor
            const ruta = `E:/Usuarios/matti/Escritorio/pdf_soundroom/pdfs/${rutaPdf2}`
            await fs.writeFile(`E:/Usuarios/matti/Escritorio/pdf_soundroom/pdfs/${rutaPdf2}`, pdfBytes);

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

    //Reporte: contar cantidad de usuarios que alquilan sala de ensayo
    app.post("/users/reportesPropietariosAlquilan", 
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
            console.log("ruta reporte propietarios que alquilan")
            console.log(dto.fechaI)
            console.log(dto.fechaH)
            
            const NewUsersReport = await  service.instance.propietariosAlquilanSala3(dto.fechaI, dto.fechaH)
            console.log('ruta descargar reporte prop alquilan, result: ', NewUsersReport)

            resp.json(NewUsersReport)    
    }))

    //descargar reporte propietarios que alquilan
    app.post("/users/descargarReportesPropietariosAlquilan", 
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
            console.log("ruta reporte propietarios que alquilan")
            console.log(dto.fechaI)
            console.log(dto.fechaH)
            
            const NewUsersReport = await  service.instance.propietariosAlquilanSala3(dto.fechaI, dto.fechaH)
            console.log('ruta descargar reporte prop alquilan, result: ', NewUsersReport)

            if ('msg' in NewUsersReport) {
                // Manejar el caso en que no se encontraron usuarios
                console.log('ruta descargar reporte prop alquilan, mensaje:', NewUsersReport.msg);
                resp.status(404).json({ error: NewUsersReport.msg });
                return;
            }

            const fechaInicio =  dto.fechaI
            const fechaHasta =  dto.fechaH
            //Codigo Javascript :
            const chartImage = await generateReporteBarChart(NewUsersReport.labels, NewUsersReport.datasets[0].data, 'Usuarios Propietarios que alquilan sala'); // Generar el gráfico de barras
            //const chartImageBasic = await generateBarChart(mesesString, arrCantidades); // Generar el gráfico de barras
            const pdfBytes = await generateReportePDF(chartImage, 'Reporte - Usuarios Propietarios que alquilan sala', fechaInicio, fechaHasta); // Generar el PDF con el gráfico

            // crear nombre de archivo irrepetible
            const currentDate = new Date().toISOString().replace(/:/g, '-');
            const currentDatee = new Date()
            const currenDay = currentDatee.getDay()
            const currenMonth = currentDatee.getMonth()
            const currenYear = currentDatee.getFullYear()
            const currenHour = currentDatee.getTime()

            const rutaPdf = `report_${currentDate}.pdf`
            const rutaPdf2 = `report_${currenDay}${currenMonth}${currenYear}${currenHour}.pdf`

            // Guardar el archivo PDF en el servidor
            const ruta = `E:/Usuarios/matti/Escritorio/pdf_soundroom/pdfs/${rutaPdf2}`
            await fs.writeFile(`E:/Usuarios/matti/Escritorio/pdf_soundroom/pdfs/${rutaPdf2}`, pdfBytes);

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

    //Reporte: contar cantidad de usuarios que alquilan sala de ensayo con enlace de descarga pdf

    //No se usa, se usa el de arriba
    app.get("/users/reportesPropietariosAlquilanPdf", 
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
            
            const NewUsersReport = await  service.instance.propietariosAlquilanSala(dto.fechaI, dto.fechaH)
            console.log('ruta:', NewUsersReport)

            //armar dos array uno con mes y otro con cantidad
            let arrMeses : string[]= []
            let arrCantidades : number[] = []
            NewUsersReport.forEach(item => {
                // meses esta designado con el nro de mes q le corresponde
                arrMeses.push(item.mes);
                arrCantidades.push(item.cantidad);
            });
            console.log('NewUsersReport:', NewUsersReport)

            //newUserReports  es un arreglo de objects 
            //resultados: { año: number, mes: number, cantidad: number }
            
            //convierto array de numeros a array de string, que contiene los meses
            const mesesString = convertirMeses(arrMeses)
            //codigo typescript
            // //crear chart
            // const { barChart, pieChart } = await createCharts(mesesString, arrCantidades);
            
            // // Generar el PDF
            // const pdfBytes = await generatePDF(mesesString, arrCantidades);

            // // Guardar el PDF en un archivo
            // const fileName = 'graficos.pdf';
            // await fs.promises.writeFile(fileName, pdfBytes);

            // // Devolver la URL de descarga
            // const downloadUrl = `${req.protocol}://${req.get('host')}/${fileName}`;

            // resp.json({NewUsersReport, downloadUrl})    
            
            
            //Codigo Javascript :
            const chartImage = await generateBarChartExample(mesesString, arrCantidades); // Generar el gráfico de barras
            //const chartImageBasic = await generateBarChart(mesesString, arrCantidades); // Generar el gráfico de barras
            const pdfBytes = await generatePDF(chartImage); // Generar el PDF con el gráfico
    
            const pdfPath = '/generated.pdf'; // Ruta donde se guardará el archivo PDF
            //await fs.writeFile(pdfPath, pdfBytes); // Guardar el PDF en el servidor
            
            // const imageUrl2 = `/public/${pdfPath}`
            // const fileUrl = `${req.protocol}://${req.get('host')}/generated.pdf`; // Obtener la URL del archivo PDF
            const directorioPDF = path.join(__dirname, './generated.pdf');
            console.log(directorioPDF)
            
            // crear nombre de archivo irrepetible
            const currentDate = new Date().toISOString().replace(/:/g, '-');
            const rutaPdf = `report_${currentDate}.pdf`
            
            await fs.writeFile( `E:/Usuarios/matti/Escritorio/pdf_soundroom/${rutaPdf}`, pdfBytes); // Guardar el PDF en el servidor
            
            resp.json({NewUsersReport, directorioPDF}) 
    }))

    //TODO Promedio estrellas de artista
    app.get("/artistaPromedio/", run( async(req: Request, res: Response)=>{

        //idArtista
        const id = req.query.id as string
        const idArtist = mongoose.Types.ObjectId(id)
         // Encontrar opiniones por idArtist
        //  const opiniones: OpinionDto[] = await OpinionModel.find({idArtist: idArtist });
        //  // Calcular el promedio de estrellas
        //  console.log('opiniones al artista: ', opiniones)
        //  if (opiniones.length = 0) {
        //      return res.json( 0 );
        //  }
 
        //  const totalEstrellas = opiniones.reduce((total, opinion) => total + opinion.estrellas, 0);
        //  const promedio = totalEstrellas / opiniones.length;

        //retorna solo el numero, ej: 3.5
       // res.json(promedio)

        // try {
        //     const result = await OpinionModel.aggregate([
        //         { $match: { idArtist: new mongoose.Types.ObjectId(id) } },
        //         { $group: { _id: null, averageRating: { $avg: "$estrellas" } } }
        //     ]);
    
        //     if (result.length > 0) {
        //         res.json(result[0].averageRating)
        //     } else {
        //         res.json(0) // Si no hay opiniones para ese artista
        //     }
        // } catch (error) {
        //     console.error("Error calculando el promedio de estrellas:", error);
        //     throw error;
        // }

        //forma 3;
         // Buscar todas las opiniones para el artista
         const opiniones = await OpinionModel.find({ idArtist: idArtist });
         console.log('opiniones al artista: ', opiniones)

         if (opiniones.length === 0) {
             return res.json(0) // Si no hay opiniones para ese artista
         }

         // Calcular el promedio de estrellas
        const totalEstrellas = opiniones.reduce((acc, opinion) => acc + opinion.estrellas, 0);
        const promedioEstrellas = totalEstrellas / opiniones.length;
        console.log('promedio de estrellas de artista: ', promedioEstrellas)

        res.json( promedioEstrellas)
 

    }) )

    //Descarga de Reporte como Pdf:
    app.post("/users/descargarReportesNuevosUsers", 
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
            const fechaInicio =  dto.fechaI
            const fechaHasta =  dto.fechaH
            // const users : UserDto[] = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            let dtoNewUsersReport = [] 
            //dias = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            //const NewUsersReport = await  service.instance.reporteUserByDateRange2(dto.fechaI, dto.fechaH)
            //const NewUsersReport = await  service.instance.obtenerCantidadDocumentosPorMes(dto.fechaI, dto.fechaH)
            const NewUsersReport2 = await  service.instance.reporteNuevosUsuarios(dto.fechaI, dto.fechaH)
            
            //Codigo Javascript :
            const chartImage = await generateReporteBarChart(NewUsersReport2.labels, NewUsersReport2.datasets[0].data, 'Usuarios Nuevos'); // Generar el gráfico de barras
            //const chartImageBasic = await generateBarChart(mesesString, arrCantidades); // Generar el gráfico de barras
            const pdfBytes = await generateReportePDF(chartImage, 'Reporte - Usuarios Nuevos', fechaInicio, fechaHasta); // Generar el PDF con el gráfico
    
            const pdfPath = '/generated.pdf'; // Ruta donde se guardará el archivo PDF
            //await fs.writeFile(pdfPath, pdfBytes); // Guardar el PDF en el servidor
            
            // const imageUrl2 = `/public/${pdfPath}`
            // const fileUrl = `${req.protocol}://${req.get('host')}/generated.pdf`; // Obtener la URL del archivo PDF
            //days
            //directorio od se usa mas abajo
            //const directorioPDF = path.join(__dirname, './generated.pdf');
            //console.log(directorioPDF)
            
            // crear nombre de archivo irrepetible
            const currentDate = new Date().toISOString().replace(/:/g, '-');
            const currentDatee = new Date()
            const currenDay = currentDatee.getDay()
            const currenMonth = currentDatee.getMonth()
            const currenYear = currentDatee.getFullYear()
            const currenHour = currentDatee.getTime()

            const rutaPdf = `report_${currentDate}.pdf`
            const rutaPdf2 = `report_${currenDay}${currenMonth}${currenYear}${currenHour}${currenHour}.pdf`
            
            // await fs.writeFile( `E:/Usuarios/matti/Escritorio/pdf_soundroom/${rutaPdf2}`, pdfBytes); // Guardar el PDF en el servidor
            
            // resp.json({NewUsersReport2, directorioPDF}) 

            //nueva version para descargar pdf creado
            // Definir el directorio donde se guardará el archivo
            const directorioPDF = path.join(__dirname, 'public', 'pdfs', rutaPdf);

            // Guardar el archivo PDF en el servidor
            const ruta = `E:/Usuarios/matti/Escritorio/pdf_soundroom/pdfs/${rutaPdf2}`
            await fs.writeFile(`E:/Usuarios/matti/Escritorio/pdf_soundroom/pdfs/${rutaPdf2}`, pdfBytes);

            // Enviar el archivo al cliente
            resp.setHeader('Content-Disposition', `attachment; filename="${rutaPdf2}"`);
            resp.setHeader('Content-Type', 'application/pdf');
            resp.download(
                ruta, rutaPdf2
                //ruta, rutaPdf2
                , (err) => {
                if (err) {
                    console.error('Error al enviar el archivo:', err);
                    resp.status(500).send('Error al descargar el archivo');
                }
            
            })

        }))
        
//---------------------------------- Enviar Enlace olvide mi coontraseña--------------------------------------

app.post("/user/forgot-password", 
    run(async (req, res) => {
        const { email } = req.body;
        console.log('user/forgot-password- email:', email)
        const user = await UserModel.findOne({ email });
        console.log('usuario encontrado: ', user)
        if (!user) return res.status(400).json({ message: "Usuario no encontrado" });
    
        // Generar token y expiración
        const token = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = token;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora
        await user.save();
    
        // Enlace de recuperación
        const resetLink = `http://localhost:19006/reset-password/${token}`;
        //await sendEmail(email, "Recuperación de contraseña", `Haz click en el siguiente enlace para restablecer tu contraseña: ${resetLink}`);
        await sendEmailAsync({
            to:email, 
            subject: "Recuperación de contraseña", 
            text:  `Haz click en el siguiente enlace para restablecer tu contraseña: ${resetLink}`})
        res.json({ message: "Revisa tu correo para restablecer tu contraseña",
            resetLink:' http://localhost:19006/reset-password/',
            token: token
         });
    })
);

app.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
    const user = await UserModel.findOne({ 
        resetPasswordToken: token, 
        resetPasswordExpires: { $gt: new Date(Date.now()) }
    });

    if (!user) return res.status(400).json({ message: "Token inválido o expirado" });

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    //logear usuario

    const loginResponse = await service.instance.login(user.email, user.password)
    res.json( loginResponse)    

    //res.json({ message: "Contraseña actualizada correctamente" });
});


}