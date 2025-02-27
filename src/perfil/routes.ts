import * as service from "./service";
import * as validator from "express-validator";
import { run } from "../common/utils/run";
import { Application, Request, Response } from "express";

import { PerfilDto, PermisoDto } from "./dto";

import { ErrorCode } from "../common/utils/constants";
import {ValidatorUtils} from "../common/utils/validator_utils"
import { auth } from "../server/middleware";
import { admin } from "../server/middleware";
// import { PermisoDoc } from "./modelPermiso";


/**
*
* @param {Express} app 
*/

export const route = (app: Application) => {

    app.get("/perfiles/",
        run (async (req: Request, resp: Response) =>{
        const perfiles : PerfilDto[] = await service.instance.getAllPerfiles()
        console.log(perfiles)
        resp.json(perfiles)
    }))

    app.get("/permisos/", 
        auth, admin, 
        run( async ( req: Request, resp: Response) =>{
        const permisos: PermisoDto[]=await service.instance.getAllPermisos()
        resp.json(permisos)
    }))
    
    app.get("/permisosDisabled/",
        auth, admin,
        run( async ( req: Request, resp: Response) =>{
        const permisos: PermisoDto[]=await service.instance.getAllPermisosDisabled()
        resp.json(permisos)
    }))

    app.get("/perfil/", 
        auth, run (async(req: Request, resp: Response) => {
        const id = req.query.id as string
        console.log(id)
        const perfil : PerfilDto = await service.instance.findPerfilById(id);
        resp.json(perfil)
    }))
    
    app.get("/permiso/findPermisoById/", 
        auth, admin,
        run( async(req: Request, resp: Response)=>{
        const id = req.query.id as string
        const permiso: PermisoDto = await service.instance.findPermisoById(id)
        resp.json(permiso)
    }))

    app.post("/perfiles/",
        auth, admin,
        validator.body("name").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        run(async(req:Request, resp:Response) => {
            const error =validator.validationResult(req)
            if( error && !error.isEmpty()){
                throw ValidatorUtils.toArgumentsException(error.array())
            }
            const dto = req.body
            const perfil = await service.instance.createPerfil({
                name: dto["name"]
            })
            resp.json(perfil)
        })
    )

    app.post("/permisos/",
        auth, admin,
        validator.body("name").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        // validator.body("idPerfil").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        run( async(req: Request, resp: Response) => {
            const errors = validator.validationResult(req)
                    if(errors && !errors.isEmpty()){
                        throw ValidatorUtils.toArgumentsException(errors.array())
            }
            const dto = req.body
            const permiso = await service.instance.createPermiso({
                name: dto["name"],
                enabled: dto["enabled"]
            })
        resp.json(permiso)
    }))

    app.put("/permiso/",
        auth, admin,
        validator.query("id").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        run( async( req: Request, resp: Response) => {
            const errors = validator.validationResult(req)
                if(errors && !errors.isEmpty()){
                    throw ValidatorUtils.toArgumentsException(errors.array())
                }
            const dto = req.body
            const id = req.query.id as string
            const permisoOriginal : PermisoDto = await service.instance.findPermisoById(id)
                if(!dto["name"]){
                    dto["name"] = permisoOriginal["name"];
                }
                if(!dto["enabled"]){
                    dto["enabled"] = permisoOriginal["enabled"];
                }
            const permiso = await service.instance.updatePermiso(id, {
                name: dto["name"],
                enabled: dto["enabled"]
            })
        resp.json(permiso)
    })
    )

    app.put("/perfil/update/",
        auth, admin,
        validator.query("id").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        run( async( req: Request, resp: Response) => {
            const errors = validator.validationResult(req)
                if(errors && !errors.isEmpty()){
                    throw ValidatorUtils.toArgumentsException(errors.array())
                }
            const dto = req.body
            const id = req.query.id as string
            const perfilOriginal : PerfilDto = await service.instance.findPerfilById(id)
                if(!dto["name"]){
                    dto["name"] = perfilOriginal["name"];
                }
            const perfil = await service.instance.updatePerfil(id, {
                name: dto["name"],
                permisos: dto["permisos"]
            })
        resp.json(perfil)
    })
    )

    app.put("/perfil/addPermisoToPerfil/",
        auth, admin,
        validator.query("id").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        run( async( req: Request, resp: Response) => {
            const errors = validator.validationResult(req)
                if(errors && !errors.isEmpty()){
                    throw ValidatorUtils.toArgumentsException(errors.array())
                }
            const dto = req.body
            const id = req.query.id as string
            const perfilOriginal : PerfilDto = await service.instance.findPerfilById(id)
                if(!dto["name"]){
                    dto["name"] = perfilOriginal["name"];
                }
            const perfil = await service.instance.addPermisoToPerfil(id, {
                name: dto["name"],
                permisos: dto["permisos"]
            })
            resp.json(perfil)
        })
        )

    app.put("/perfil/deletePermisoFromPerfil/",
        auth, admin,
        validator.query("id").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        run( async( req: Request, resp: Response) => {
            const errors = validator.validationResult(req)
                if(errors && !errors.isEmpty()){
                    throw ValidatorUtils.toArgumentsException(errors.array())
                }
            const dto = req.body
            const id = req.query.id as string
            const perfilOriginal : PerfilDto = await service.instance.findPerfilById(id)
                if(!dto["name"]){
                    dto["name"] = perfilOriginal["name"];
                }
            const perfil = await service.instance.deletePermisoFromPerfil(id, {
                name: dto["name"],
                permisos: dto["permisos"]
            })
        resp.json(perfil)
    })
    )

    app.put("/permiso/deletePerfil/",
    validator.query("id").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    run( async( req: Request, resp: Response) => {
        const errors = validator.validationResult(req)
            if(errors && !errors.isEmpty()){
                throw ValidatorUtils.toArgumentsException(errors.array())
            }
        const id = req.query.id as string
        console.log(id)
        const perfil = await service.instance.deletePerfil(id)
        resp.json(perfil)
    })
    )

    app.put("/permiso/deletePermiso/",
    validator.query("id").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    run( async( req: Request, resp: Response) => {
        const errors = validator.validationResult(req)
            if(errors && !errors.isEmpty()){
                throw ValidatorUtils.toArgumentsException(errors.array())
            }
        //const dto = req.body
        const id = req.query.id as string
        console.log(id)
        // const permisoOriginal : PermisoDto = await service.instance.findPermisoById(id)
        //     if(!dto["name"]){
        //         dto["name"] = permisoOriginal["name"];
        //     }
        //     if(!dto["enabled"]){
        //         dto["enabled"] = permisoOriginal["enabled"];
        //     }
        const perfil = await service.instance.deletePermiso(id)
        //     , {
        //     name: dto["name"],
        //     enabled:dto["enabled"],
        // }
        
        resp.json(perfil)
    })
    )


}