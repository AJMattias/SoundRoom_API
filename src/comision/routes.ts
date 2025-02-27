import * as service from "./service"
import * as validator from "express-validator"
import {run} from "../common/utils/run"
import {Application, Request, Response} from "express"
import {admin, auth} from "../server/middleware"
import {ComisionDto} from "./dto"
import {StringUtils} from "../common/utils/string_utils"
import {ArgumentsException, AuthorizationException} from "../common/exception/exception"
import {ErrorCode} from "../common/utils/constants"
import {ValidatorUtils} from "../common/utils/validator_utils"
import { dangerouslyDisableDefaultSrc } from "helmet/dist/middlewares/content-security-policy"

export const route = (app: Application) => {

    app.get("/comisiones/",
    auth, 
    admin, 
    run( async( req: Request, resp: Response)=>{
        const comisiones : ComisionDto[] = await service.instance.getAllComisiones()
        resp.json(comisiones)
    }))

    app.get("/comision/",
    validator.query("id").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    run(async ( req: Request, resp: Response)=>{
        const id = req.params.id as string
        const comision : ComisionDto = await service.instance.findComisionById(id)
        resp.json(comision)
    }))

    app.post("/comision/", 
    auth, admin, 
    validator.body("porcentaje").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    run( async( req: Request, resp: Response)=>{
        const errors = validator.validationResult(req)
        if(errors && !errors.isEmpty()){
            throw ValidatorUtils.toArgumentsException(errors.array())
        }
        const dto = req.body
        const comision = await service.instance.createComision({
            porcentaje: dto["porcentaje"]
        })
        resp.json(comision)
    }))

    app.get("/comision/getEnabled/",
    run(async ( req: Request, resp: Response)=>{
        const comision : ComisionDto = await service.instance.findEnabled()
        console.log(comision)
        resp.json(comision)
    }))

    app.put("/comision/actualizarComision/", auth, admin,
    validator.query("id").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED), 
    //validator.body("porcentaje").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    run(async( req: Request, resp: Response)=>{
        const errors = validator.validationResult(req)
        if(errors && !errors.isEmpty()){
            throw ValidatorUtils.toArgumentsException(errors.array())
        }
        const id = req.query.id as string
        //const dto = req.body
        // const original : ComisionDto = await service.instance.findEnabled()
        // if(!dto["porcentaje"]){
        //     dto["porcentaje"] = original["porcentaje"]
        // }
        // if(!dto["createdAt"]){
        //     dto["createdAt"] = original["createdAt"]
        // }
        const comision = await service.instance.updateComisionEnabled(id
            //, {
            //porcentaje: dto["porcentaje"],
            //createdAt: dto["createdAt"]}
        )
        console.log('route response: ', comision)
        resp.json(comision)
    }))

    app.put("/comision/deleteComision/", auth, admin,
    validator.query("id").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED), 
    run(async( req: Request, resp: Response)=>{
        const errors = validator.validationResult(req)
        if(errors && !errors.isEmpty()){
            throw ValidatorUtils.toArgumentsException(errors.array())
        }
        const id = req.query.id as string
        const comision = await service.instance.deleteComision(id)
        resp.json(comision)
    }))

}
