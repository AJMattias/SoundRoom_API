import * as service from "./service";
import * as validator from "express-validator";
import { run } from "../common/utils/run";
import { Application, Request, Response } from "express";

import { ComodidadDto } from "./dto";

import { ErrorCode } from "../common/utils/constants";
import {ValidatorUtils} from "../common/utils/validator_utils"


/**
*
* @param {Express} app 
*/

export const route = (app: Application) => {

    app.get("/comodidades/", run (async (req: Request, resp: Response) =>{
        const comodidades : ComodidadDto[] = await service.instance.getAllComodidades()
        resp.json(comodidades)
    }))

    app.get("/comodidades/:id", run (async(req: Request, resp: Response) => {
        const comodidades : ComodidadDto = await service.instance.findComodidadById(`id`)
        resp.json(comodidades)
    }))

    app.post("/comodidades/",
        validator.body("name").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        
        run(async(req:Request, resp:Response) => {
            const error =validator.validationResult(req)
            if( error && !error.isEmpty()){
                throw ValidatorUtils.toArgumentsException(error.array())
            }
            const dto = req.body
            const comodidad = await service.instance.createComodidad({
                name: dto["name"]
            })
            resp.json(comodidad)
        })
    )


}