import * as service from "./service"
import * as validator from "express-validator"
import { run } from "../common/utils/run";
import { Application, Request, Response } from "express";
import { OpinionDto, PaginatedResponseDto, SalaDeEnsayoDto} from "./dto";
import {ErrorCode} from "../common/utils/constants"
import {OpinionModel, SalaDeEnsayoDoc, SalaDeEnsayoModel } from "./model";
import {ValidatorUtils} from "../common/utils/validator_utils"
import multer from "../common/utils/storage";
import  * as imageService from "../imagen/service"
import { admin, auth, checkArtistOrSalaDeEnsayo, checkPermission, validarDiaSemana } from "../server/middleware";
import { UserDto } from "../users/dto";
import * as userService from "../users/service"
import { PerfilModel } from "../perfil/models";
import { generateReporteBarChart, generateReportePDF, generateReportePieChart, generateReporteValoracionesPDF } from "../common/utils/generateReportePdf";
import * as perfilService from "../perfil/service";
import { cloudinary } from "../common/utils/cloudinaryConfig";
import * as Email from '../server/MailCtrl';
import fs from 'fs-extra';


/**
 * 
 * @param {express} app 
 */

export const route = (app: Application) => {

  const DEFAULT_PAGE = 1;
  const DEFAULT_LIMIT = 10; // Un buen valor por defecto

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
      const busqueda = req.query.q;

      // VALIDACIÓN CRÍTICA: Asegúrate de que 'q' es una cadena
      if (typeof busqueda !== 'string' || busqueda.trim() === '') {
          // Podrías devolver un 400 Bad Request o simplemente un array vacío si es permisivo
          return resp.status(400).json({ error: "El parámetro de búsqueda 'q' es obligatorio." });
      }
      console.log('Ruta: Buscando por:', busqueda);
      // Ahora pasas la cadena validada
      const salas : SalaDeEnsayoDto[] = await service.instance.findByName(busqueda); 

      console.log('Ruta: Salas buscadas por nombre:', salas); // Este CLG debería verse
      resp.json(salas);    
    }))
    
  

 app.get("/salasdeensayo/findByNamePaginated/",
    auth,
    checkPermission(['BUSCAR_SALA_DE_ENSAYO']),
    run(async (req: Request, resp: Response) => {
        
        const busqueda = req.query.q as string;
        
        // --- 1. Obtener y validar Parámetros de Paginación ---
        
        // Convertir page y limit a números, asignando valores por defecto si no existen
        const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
        const limit = parseInt(req.query.limit as string) || DEFAULT_LIMIT;

        // Validación básica
        if (page <= 0 || limit <= 0) {
            return resp.status(400).json({ error: "Los parámetros 'page' y 'limit' deben ser números positivos." });
        }

        // --- 2. Validar Parámetro de Búsqueda ---
        
        if (typeof busqueda !== 'string' || busqueda.trim() === '') {
            return resp.status(400).json({ error: "El parámetro de búsqueda 'q' es obligatorio." });
        }
        
        // --- 3. Llamada al Servicio con Paginación ---
        
        console.log(`Ruta: Buscando por: ${busqueda}, Page: ${page}, Limit: ${limit}`);

        // El servicio ya devuelve el objeto completo {page, limit, total, data: []}
        const salasPaginated: PaginatedResponseDto<SalaDeEnsayoDto> = 
            await service.instance.findByNamePaginated(busqueda.trim(), page, limit);

        // 4. Devolver la respuesta completa (ya está en el formato correcto)
        resp.json(salasPaginated); 
    })
);

    //TODO findbyOwner
    app.get("/salasdeensayo/findByOwner/",
        auth, 
        run(async (req: any, resp: Response) => {
            const id = req.query.id as string
            const user = req
            console.log('req user :', req.user)
            console.log('user.id: ', user.id)
            console.log('id: ', id)
            const salas : SalaDeEnsayoDto[] = await service.instance.findSalaByOwner(req.user.id)
            console.log('salas: ', salas)
            resp.json(salas)    
    }))

    app.get('owner/:idOwner',
      auth,
      run(async (req: any, resp: Response) => {
      try {
      const idOwner = req.user.id as string;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const salas = await service.instance.findSalaByOwnerPaginated(idOwner, page, limit);

      // 200 OK
      resp.status(200).json({
        status: 'success',
        data: salas.data,
        page: salas.page,
        total: salas.total,
        totalPages: salas.totalPages
      });

    } catch (error) {
      console.error('Error getting salas paginadas:', error);

      // 500 Internal Server Error
      resp.status(500).json({
        status: 'error',
        message: 'Error al obtener las salas del propietario',
        error: error instanceof Error ? error.message : error
      });
    }
}));
    

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
                descripcion: dto["descripcion"],
                imagenes: dto["imagenes"]
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
    validarDiaSemana,
    validator.body("nameSalaDeEnsayo").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    validator.body("calleDireccion").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    // validator.body("numeroDireccion").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    //validator.body("duracionTiempo").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    
    //descomentar cuando se agrege al front
    // validator.body("idType").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    validator.body("descripcion").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    validator.body("precioHora").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    //validator.body("horarios").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    //validator.body("idLocality").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        
        run(async ( req: any, resp: Response) =>{
            const errors = validator.validationResult(req)
            if(errors && !errors.isEmpty()){
                throw ValidatorUtils.toArgumentsException(errors.array())
            }
            const dto = req.body
            //obtener usuario logueado con:
            const logged = req.user 
            console.log('logged user.idPerfil: ', logged.idPerfil)
            //user.idPErfil solo es el id, pero en console log me muestra todo el objeto perfil, para poder usar perfil debo buscarlo
            const {_id} = logged.idPerfil
            const perfil = await perfilService.instance.findPerfilById(logged.idPerfil._id)
            console.log('perfil._id: ', perfil?._id)
            const {imagenes, ...data} = req.body
            //let imagenes =[]
            //dto.images ? imagenes=dto.images : imagenes=[]
            //console.log('req.body: ', req.body)
            console.log('dto data sala: ', data)
            console.log('datos: ', data.nameSalaDeEnsayo, data.calleDireccion, data.precioHora, data.descripcion, data.comodidades, data.enabled)
            console.log('data imagenes: ', imagenes)
            
            //create  sala de ensayo
            const sala = await service.instance.createSalaDeEnsayo({
                nameSalaEnsayo: data.nameSalaDeEnsayo,
                calleDireccion: data.calleDireccion,
                precioHora: data.precioHora,
                idType: data.idType,
                idOwner: req.user.id,
                duracionTurno: data.duracionTurno,
                descripcion: data.descripcion,
                comodidades: data.comodidades,
                enabled: data.enabled,
                imagenes: imagenes? imagenes : null,
                horarios: data.horarios ? data.horarios : null
            })
            //añadir sala creado al array idSalaDeEnsayo de User
            const idSala = sala.id
            
            let perfilId = perfil?._id
            
            const user = req.user
            // Buscar el perfil "Sala de Ensayo"
            const perfilSala = await PerfilModel.findOne({ name: 'Sala de ensayo' }).exec();
            console.log('ruta, perfil sala: ', perfilSala)
            if(perfil?.name === perfilSala?.name){
              //sino existe el perfil sde seguira con el perfil asignado anteriormente
              perfilId = perfilSala?._id
              const userUpdate = await userService.instance.updateUser(user.id, {
                name: user.name,
                last_name: user.last_name,
                email: user.email,
                password: user.password,
                idPerfil: perfilId,
                idArtistType: user.idArtistType,
                idArtistStyle: user.idArtistStyle,
                image_id: undefined,
                enabled: user.enabled,
                userType: user.userType,
                tipoArtista: user.tipoArtista
              })
              if(!userUpdate){
                throw new Error("No se puedo actualizar el usuario con el perfil Sala de Ensayo")
              }
            }

            //se actualiza el usuario con la nueva sala
            const salaAdded = await userService.instance.updateAddSala(user.id, {
              name: user.name,
              last_name: user.last_name,
              email: user.email,
              password: user.password,
              idPerfil: perfilId,
              idArtistType: user.idArtistType,
              idArtistStyle: user.idArtistStyle,
              image_id: undefined,
              enabled: user.enabled,
              userType: user.userType,
              idSalaDeEnsayo: idSala,
              tipoArtista: user.tipoArtista
            })
            if(!salaAdded){
                throw new Error("No se puedo actualizar el usuario con la Sala de Ensayo")
            }
            

           // copiar a perfil con usuario
           resp.json({status: 200, id: sala.id, msg: "Sala creada correctamente"})
        
          }
        ) 
    )  

    //endpint with 1 image
    // app.post("/salasdeensayo_imagen/", multer.single('img'),
    // auth,
    // checkPermission(['CREAR_SALA_DE_ENSAYO']),
    // validator.body("nameSalaDeEnsayo").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    // validator.body("calleDireccion").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    // validator.body("numeroDireccion").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    // validator.body("precioHora").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    // validator.body("idType").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    // //validator.body("idLocality").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        
    //     run(async ( req: Request, resp: Response) =>{
    //         const errors = validator.validationResult(req)
    //         if(errors && !errors.isEmpty()){
    //             throw ValidatorUtils.toArgumentsException(errors.array())
    //         }
    //         const dto = req.body

    //         if (!req.file || !req.file.buffer) {
    //           // Manejar error si no hay archivo
    //           throw new Error("No se encontró el archivo de imagen en la petición.");
    //         }

    //         //guardo imagen
    //         const titulo = dto["titulo"]
    //         const descripcion = dto["descripcionImg"]
    //         const imageUrl = req.file?.path as string
    //         const newImagen = {
    //             titulo: titulo,
    //             descripcion: descripcion, 
    //             url: imageUrl,
    //             public_id: 'lalala'
    //         };
    //         console.log("route image ", newImagen)
    //         const newurl = `${process.env.APP_HOST}:${process.env.APP_PORT}/public/${req.file?.filename}`
    //         console.log(newurl)
    //         console.log("image name: ", req.file?.filename);
    //         const imagen = await imageService.instance.createImagen(newImagen) 
    //         console.log("id imagen: ", imagen.id)
    //         //guardo sala de ensayo con el id de la imagen
    
    //         const sala = await service.instance.createSalaDeEnsayo({
    //             nameSalaEnsayo: dto["nameSalaDeEnsayo"],
    //             calleDireccion: dto["calleDireccion"],
    //             precioHora: dto["precioHora"],
    //             //idImagen: imagen.id,
    //             idType: dto["idType"],
    //             idOwner: dto["idOwner"],
    //             duracionTurno: dto["duracionturno"],
    //             descripcion: dto["descripcion"],
    //             comodidades: dto["comodidades"],
    //             imagenes: dto["imagenes"]

    //         })
    //         resp.json(sala)
    //       }
    //     ) 
    // )

    // app.put("/salasdeensayo/update/", 
    // auth,
    // checkPermission(['EDITAR_SALA_DE_ENSAYO']),
    // validator.query("id").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    // run( async(req: any, resp: Response) => {
    //     const errors = validator.validationResult(req)
    //         if(errors && !errors.isEmpty()){
    //             throw ValidatorUtils.toArgumentsException(errors.array())
    //         }
    //         const dto = req.body
    //         const id = req.query.id as string
    //         const salaOriginal : SalaDeEnsayoDto = await service.instance.findSalaById(id)
    //         if(!dto["nameSalaEnsayo"]){
    //             dto["nameSalaEnsayo"] = salaOriginal["nameSalaEnsayo"];
    //         }
    //         if(!dto["calleDireccion"]){
    //             dto["calleDireccion"] = salaOriginal["calleDireccion"];
    //         }
    //         if(!dto["numeroDireccion"]){
    //             dto["numeroDireccion"] = salaOriginal["numeroDireccion"];
    //         }
    //         if(!dto["precioHora"]){
    //             dto["precioHora"] = salaOriginal["precioHora"];
    //         }
    //         if(!dto["duracionTurno"]){
    //             dto["duracionTurno"] = salaOriginal["duracionTurno"];
    //         }
    //         if(!dto["descripcion"]){
    //             dto["descripcion"] = salaOriginal["descripcion"];
    //         }
    //         if(!dto["comodidades"]){
    //             dto["comodidades"] = salaOriginal["comodidades"];
    //         }
    //         if(!dto["enabled"]){
    //             dto["enabled"] = salaOriginal["enabled"];
    //         }
    //         if(!dto["createdAt"]){
    //             dto["createdAt"] = salaOriginal["createdAt"];
    //         }
    //         if(!dto["imagenes"]){
    //             dto["imagenes"] = salaOriginal["imagenes"];
    //         }
    //         if(!dto["horarios"]){
    //             dto["horarios"] = salaOriginal["horarios"];
    //         }

    //         console.log('ruta update sala: ', dto)

    //         //TODO eliminar imagenes
    //         const deletedImages = dto["imagesToDelete"] as string[] || []
    //         for (const imageId of deletedImages) {
    //           try {
    //             const imagen = await imageService.instance.findImagenById(imageId)
    //             //TODO borrar imagen de claudinary, si se borra , se borra de la base de datos
    //             cloudinary.uploader.destroy(imagen.public_id);
    //             if(imagen){
    //               await imageService.instance.deleteImage(imageId, imagen)
    //             }
    //           } catch (error) {
    //             console.log('Error eliminando imagen: ',imageId, error)
    //             resp.json({status: 500, msg: `Error al eliminar la imagen `, error})
    //           }  
    //         }

    //         //TODO subir nuevas imagenes
    //         const sala = await service.instance.updateSalaDeEnsayo(id,{
    //             nameSalaEnsayo: dto["nameSalaEnsayo"],
    //             calleDireccion: dto["calleDireccion"],
    //             numeroDireccion: dto["numeroDireccion"],
    //             duracionTurno: dto["duracionTurno"],
    //             precioHora: dto["precioHora"],
    //             comodidades: dto["comodidades"],
    //             descripcion: dto["descripcion"],
    //             enabled: dto["enabled"],
    //             imagenes: dto["imagenes"]
    //         })
    //         resp.json(sala)
    //     })
    // )

    app.put("/salasdeensayo/update/",
    auth,
    checkPermission(['EDITAR_SALA_DE_ENSAYO']),
    validator.query("id").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    run(async (req: Request, resp: Response) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw ValidatorUtils.toArgumentsException(errors.array());
        }

        const id = req.query.id as string;
        const dto = req.body; // El DTO (Data Transfer Object) entrante desde el frontend

        // 1. Obtener la sala original para asegurar que existan los datos y para fusiones de campos
        const salaOriginal: SalaDeEnsayoDto = await service.instance.findSalaById(id);
        if (!salaOriginal) {
            return resp.status(404).json({ status: 404, msg: "Sala de ensayo no encontrada." });
        }

        // Aquí transformas el array de objetos a un array de strings (solo los IDs)
        const incomingImageIds = dto.imagenes ? dto.imagenes.map((imagen: { id: string }) => imagen.id) : [];

        // 2. Crear un DTO para la actualización de imágenes que cumpla con tu DAO
        const imagesUpdateDto = { images: incomingImageIds };

        // 3. Lógica para eliminar imágenes antiguas de Cloudinary y la base de datos
        // El frontend envía un array de IDs de imágenes que el usuario ha eliminado.
        const deletedImageIds: string[] = dto.imagesToDelete || [];
        console.log('ruta update sala, images to delete: ', deletedImageIds);
        for (const imageId of deletedImageIds) {
            try {
                const imagen = await imageService.instance.findImagenById(imageId);
                console.log('imagen to delete: ', imagen);
                if (imagen) {
                    // 1.Borrar imagen de Cloudinary usando su public_id
                    await cloudinary.uploader.destroy(imagen.public_id);
                    console.log(`Imagen ${imageId} eliminada de Cloudinary.`);

                    // 2.Borrar la referencia de la imagen de la base de datos
                    await imageService.instance.deleteImage(imageId, imagen);
                    console.log(`Imagen ${imageId} eliminada de la base de datos.`);

                    // 3. Eliminar la referencia del array 'imagenes' de la SalaDeEnsayo ✨
                    // Usamos $pull para remover el ObjectId del array
                    await SalaDeEnsayoModel.findByIdAndUpdate(
                      id,
                      { $pull: { imagenes: imageId } }, // Elimina el ObjectId del array 'imagenes'
                      { new: true } // Para obtener el documento actualizado si lo necesitaras inmediatamente
                    );
                } else {
                    console.warn(`[ADVERTENCIA] Imagen con ID ${imageId} no encontrada en la base de datos para eliminar.`);
                }
            } catch (error) {
                console.error(`[ERROR] Fallo al eliminar la imagen con ID ${imageId}:`, error);
                // No se envía 'resp.json' aquí para permitir que el resto de la operación continúe.
                // El error se registra, pero no detiene el flujo principal.
            }
        }

        console.log('Ruta de actualización de sala - DTO recibido:', dto);

        // 5. Realizar la actualización de la sala en la base de datos
        if( imagesUpdateDto.images.length > 0){
          const salaActualizadaI = await service.instance.updateSalaDeEnsayoImagenes(id, imagesUpdateDto);
        
          if(!salaActualizadaI){
            return resp.status(500).json({ status: 500, msg: "Error al actualizar las imágenes de la sala." });
          }
        }
        //actualizar data de sala
        const salaActualizada = await service.instance.updateSalaDeEnsayo(id, dto);
        if(!salaActualizada){
            return resp.status(500).json({ status: 500, msg: "Error al actualizar la sala." });
        }

        // 6. Enviar la respuesta al cliente
        resp.json({ status: 200, msg: "Sala actualizada exitosamente", sala: salaActualizada });
    })
  );

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
            // const currentDate = new Date().toISOString().replace(/:/g, '-');
            // const currentDatee = new Date()
            // const currenDay = currentDatee.getDay()
            // const currenMonth = currentDatee.getMonth()
            // const currenYear = currentDatee.getFullYear()
            // const currenHour = currentDatee.getTime()

            // const rutaPdf = `report_${currentDate}.pdf`
            // const rutaPdf2 = `report_${currenDay}${currenMonth}${currenYear}${currenHour}${currenHour}.pdf`

            // // Guardar el archivo PDF en el servidor
            // const ruta = `C:/Users/manzu/Desktop/soundroom_final/pdf_soundroom/pdfs/${rutaPdf2}`
            // await fs.writeFile(`C:/Users/manzu/Desktop/soundroom_final/pdf_soundroom/pdfs/${rutaPdf2}`, pdfBytes);

            // // Enviar el archivo al cliente
            // resp.setHeader('Content-Disposition', `attachment; filename="${rutaPdf2}"`);
            // resp.setHeader('Content-Type', 'application/pdf');
            // resp.download(
            //     ruta, rutaPdf2, (err) => {
            //         if (err) {
            //             console.error('Error al enviar el archivo:', err);
            //             resp.status(500).send('Error al descargar el archivo');
            //         }
            //     }
            // ) })
            const nombreArchivo = `reporte_salas_nuevas_${Date.now()}.pdf`;
            resp.setHeader('Content-Type', 'application/pdf');
            resp.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
            console.log(Buffer.isBuffer(pdfBytes)); // true
            resp.write(pdfBytes); // sin Buffer.from
            resp.end();
        })
    )

    app.post("/salasdeensayo/createOpinion/",
        auth,
        checkPermission(['CALIFICAR_SALA_DE_ENSAYO']),
        validator.query("idRoom").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("descripcion").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("estrellas").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        //validator.body("idRoom").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
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

            const salaOriginal : SalaDeEnsayoDto = await service.instance.findSalaById(idRoom);
            console.log('ruta sala encontrada original', salaOriginal) 
            if(!salaOriginal){
                resp.status(404).json({msg: "Sala de ensayo no encontrada"})
                return
            }
            //create opinion
            const opinion = await service.instance.createOpinion({
                descripcion: dto["descripcion"],
                estrellas: dto["estrellas"] ,
                idUser: user.id,
                idRoom: dto["idRoom"],
                //idArtist: '',
            })
            if(!opinion){
              resp.status(500).json({ msg: "No se pudo crear la opinion"})
              return
            }
            console.log('Ruta, opinion creada: ', opinion)              
            
            //update sala con la opinion
            console.log('ruta opinion: ',opinion)
            let sala = await service.instance.updateSalaDeEnsayoOpinion(idRoom,{
                nameSalaEnsayo: salaOriginal["nameSalaEnsayo"] ?? "",
                calleDireccion: salaOriginal["calleDireccion"] ?? "",
                numeroDireccion: salaOriginal["numeroDireccion"] ?? 0,
                precioHora: salaOriginal["precioHora"] ?? 0,
                opiniones: opinion.id
            })

            if(!sala){
              resp.status(500).json({msg: "No se pudo actualizar la sala con la opinion"})
              return
            }
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

        // **MODIFICACIÓN AQUÍ:** Verificar si hay opiniones antes de calcular el promedio
        if (opiniones.length === 0) {
            // Si no hay opiniones, devolver el objeto específico
            return res.json(0);
        }

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
          console.log('get opiniones a sala: ', req.query.id)
          const id = req.query.id as string
        //buscar sala de ensayo
        const salaDeEnsayo = await service.instance.findSalaById(id);
        if (!salaDeEnsayo) {
            return res.status(404).json({ message: 'Sala de ensayo no encontrada' });
        }
        const opinionesIds = salaDeEnsayo.opiniones;
        const opiniones = await OpinionModel.find({ _id: { $in: opinionesIds } }).populate("idUser").populate("idRoom");

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


    interface GrafTortaTipoSala2 {
        labels: string;
        population: number;
    }
    
    interface GrafTortaTipoSala {
        name: string;
        population: number;
      }
      
    app.post(
      "/salasDeEnsayo/reporteTipoSalaTorta",
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
    
        async function obtenerGrafTortaTipoSala(
          fechaInicio: Date,
          fechaFin: Date
        ): Promise<GrafTortaTipoSala[]> {
          try {
            const resultados = await SalaDeEnsayoModel.aggregate([
              {
                $match: {
                  createdAt: { $gte: fechaInicio, $lte: fechaFin },
                  deletedAt: { $exists: false },
                },
              },
              {
                $group: {
                  _id: "$idType",
                  count: { $sum: 1 },
                },
              },
              {
                $lookup: {
                  from: "types", // Nombre de la colección de tipos en MongoDB
                  localField: "_id",
                  foreignField: "_id",
                  as: "typeInfo",
                },
              },
              {
                $unwind: "$typeInfo",
              },
              {
                $project: {
                  _id: 0,
                  name: "$typeInfo.name",
                  population: "$count",
                },
              },
            ]);
    
            return resultados as GrafTortaTipoSala[];
          } catch (error) {
            console.error("Error al obtener el gráfico de torta por tipo de sala:", error);
            throw error;
          }
        }
    
        try {
          const resultados = await obtenerGrafTortaTipoSala(fechaInicioObj, fechaFinObj);
          console.log("resultados tipo Torta: ", resultados);
    
          let formattedResult;
    
          if (resultados.length === 0) {
            // Caso sin datos
            formattedResult = {
              labels: ["Sin resultados"],
              datasets: [
                {
                  data: [1],
                  backgroundColor: ["#878686"], // Color gris claro o neutro
                },
              ],
            };
          } else {
            const totalPopulation = resultados.reduce((acc, result) => acc + result.population, 0);
    
            const labels: string[] = resultados.map((result) => {
              const percentage = ((result.population / totalPopulation) * 100).toFixed(2);
              return `${result.name} (${percentage}%)`;
            });
    
            const data: number[] = resultados.map((result) => result.population);
    
            formattedResult = {
              labels: labels,
              datasets: [
                {
                  data: data,
                  backgroundColor: [
                    "#FFCE56",
                    // "#FF9F40",
                  ],
                },
              ],
            };
          }
    
          return resp.status(200).json(formattedResult);
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
              console.error('Error in PDF generation route:', error);
              resp.status(500).send({ error: 'Failed to generate PDF' });
              return []
            }
          }
      
          try {

            const resultados = await obtenerGrafTortaTipoSala(fechaInicioObj, fechaFinObj);
            console.log("resultados tipo Torta: ", resultados);
      
            let formattedResult;
      
            if (resultados.length === 0) {
              // Caso sin datos
              formattedResult = {
                labels: ["Sin resultados"],
                datasets: [
                  {
                    data: [1],
                    backgroundColor: ["#878686"], // Color gris claro o neutro
                  },
                ],
              };
            } else {
              const totalPopulation = resultados.reduce((acc, result) => acc + result.population, 0);
      
              const labels: string[] = resultados.map((result) => {
                const percentage = ((result.population / totalPopulation) * 100).toFixed(2);
                return `${result.name} (${percentage}%)`;
              });
      
              const data: number[] = resultados.map((result) => result.population);
      
              formattedResult = {
                labels: labels,
                datasets: [
                  {
                    data: data,
                    backgroundColor: [
                      "#FFCE56",
                     // "#FF9F40",
                    ],
                  },
                ],
              };
            }
            const fechaInicio =  dto.fechaI
            const fechaHasta =  dto.fechaH

            //Codigo Javascript :
            const chartImage = await generateReportePieChart(formattedResult.labels, formattedResult.datasets[0].data, ' Tipos de Salas de Ensayo'); // Generar el gráfico de barras
            //const chartImageBasic = await generateBarChart(mesesString, arrCantidades); // Generar el gráfico de barras
            const pdfBytes = await generateReportePDF(chartImage, 'Reporte - Tipos de Salas de Ensayo', fechaInicio, fechaHasta); // Generar el PDF con el gráfico
                 
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
            resp.end(Buffer.from(pdfBytes));

          } catch (error) {
            return resp.status(500).json({ error: "Error al generar el reporte" });
          }
        })
      );

   
      app.get("/salasdeensayo/cantidadValoraciones/", 
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
    app.get("/salasdeensayo/descargarCantidadValoraciones/", 
        auth,
        run(async (req: any, resp: Response) => {
          try {
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
            

            //Codigo Javascript :
            const chartImage = await generateReporteBarChart(NewUsersReport.labels, NewUsersReport.datasets[0].data, 'Cantidad de valoraciones'); // Generar el gráfico de barras
            //const chartImageBasic = await generateBarChart(mesesString, arrCantidades); // Generar el gráfico de barras
            const pdfBytes = await generateReporteValoracionesPDF(chartImage, 'Reporte - Cantidad de valoraciones', salaNombre,  fechaInicio, fechaHasta ); // Generar el PDF con el gráfico

             if (!pdfBytes || pdfBytes.length === 0) {
                throw new Error("El PDF no se generó o está vacío.");
            }
            // crear nombre de archivo irrepetible
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

  //TODO probar
  app.get("/salasdeensayo/promedioCalificacionSalas/", 
    auth,
    run (async (req: any, res: Response)=>{
        const idUser = req.user.id
        const errors = validator.validationResult(req)
        if(errors && !errors.isEmpty()){
            throw ValidatorUtils.toArgumentsException(errors.array())
        }
        
        const myRooms = await service.instance.findSalaByOwner(idUser)
        if(!myRooms || myRooms.length === 0){
            console.log('No hay salas de ensayo disponibles para el usuario:', idUser)
            res.json({
                status: "success",
                promedio: 0
            })
            return
        }

       let total = 0
       for(const room of myRooms){
        const opinionesIds = room.opiniones;
        const opiniones = await OpinionModel.find({ _id: { $in: opinionesIds } });
        if (opiniones.length === 0) {
            console.log('No hay opiniones para la sala:', room.nameSalaEnsayo)
            continue; // Si no hay opiniones, saltar a la siguiente sala
        }
        const totalEstrellas = opiniones.reduce((total, opinion) => total + opinion.estrellas, 0);
        const promedio = totalEstrellas / opiniones.length;
        console.log(`Promedio de calificación para la sala ${room.nameSalaEnsayo}: ${promedio}`);
        total += promedio;
       }
        res.json({
            status: "success",
            promedio: total
        })
      }
  )) 

    app.get("/salasdeensayo/opinionesAMisSalas/", 
    auth,
    run (async (req: any, res: Response)=>{
        const idUser = req.user.id
        const errors = validator.validationResult(req)
        if(errors && !errors.isEmpty()){
            throw ValidatorUtils.toArgumentsException(errors.array())
        }
        
        const myRooms = await service.instance.findSalaByOwner(idUser)
        if(!myRooms || myRooms.length === 0){
            console.log('No hay salas de ensayo disponibles para el usuario:', idUser)
            res.json({
                status: "success",
                promedio: 0
            })
            return
        }

       let total = 0
       let opiniones: any[] = []
       for(const room of myRooms){
        const opinionesIds = room.opiniones;
        const opinionesRoom = await OpinionModel.find({ _id: { $in: opinionesIds } });
        if (opinionesRoom.length === 0) {
            console.log('No hay opiniones para la sala:', room.nameSalaEnsayo)
            continue; // Si no hay opiniones, saltar a la siguiente sala
        }
        for(const opinion of opinionesRoom){
            opiniones.push(opinion)
        }
       }
        res.json({
            status: "success",
            opiniones: opiniones
        })
      }
  )) 

  // app.get("/salasdeensayo/opinionesAmisSalas/",
  //    auth,
  //   run (async (req: any, res: Response)=>{
  //       try {
  //         const idUser = req.user.id
        
  //         const opiniones = service.instance.getMyAllOpiniones(idUser)
  //         res.json({
  //           status: "success",
  //           data: {
  //             opiniones,
  //           },
  //           message: "Opiniones obtenidas correctamente"
  //         })
  //       } catch (error) {
  //         console.error(error);
  //         return res.status(500).json({
  //           status: "error",
  //           message: "Error al obtener opiniones"
  //         });
  //       }
  //   }
  // ))


}