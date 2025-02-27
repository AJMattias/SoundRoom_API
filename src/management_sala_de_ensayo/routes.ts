import * as service from "./service";
import * as validator from "express-validator";
import { run } from "../common/utils/run";
import { Application, Request, Response } from "express";

import { TypeDto, StateSalaEnsayoDto} from "./dto";

import { ErrorCode } from "../common/utils/constants";
import {ValidatorUtils} from "../common/utils/validator_utils"
import { auth, checkArtistOrSalaDeEnsayo } from "../server/middleware";


/**
*
* @param {Express} app 
*/

export const route = (app: Application) => {
    //para los estados de la sala de ensayo
    app.get("/managementState/",
        auth,
        run (async (req: Request, resp: Response) =>{
        const stateSalaEnsayo : StateSalaEnsayoDto[] = await service.instance.getAllStateSalaEnsayos()
        resp.json(stateSalaEnsayo)
    }))

    app.get("/managementState/:id", run (async(req: Request, resp: Response) => {
        const stateSalaEnsayo : StateSalaEnsayoDto = await service.instance.findStateSalaEnsayoById(`id`)
        resp.json(stateSalaEnsayo)
    }))

    app.post("/managementState/",
        validator.body("name").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        
        run(async(req:Request, resp:Response) => {
            const error =validator.validationResult(req)
            if( error && !error.isEmpty()){
                throw ValidatorUtils.toArgumentsException(error.array())
            }
            const dto = req.body
            const stateSalaEnsayo = await service.instance.createStateSalaEnsayo({
                name: dto["name"]
            })
            resp.json(stateSalaEnsayo)
        })
    )

    //Para la parte de tipo de sala de ensayo
    app.get("/managementType/",
        auth, 
        run (async (req: Request, resp: Response) =>{
        const type : TypeDto[] = await service.instance.getAllTypes()
        console.log('ruta type sala: ', type)
        resp.json(type)
    }))

    app.get("/managementType/:id", run (async(req: Request, resp: Response) => {
        const type : TypeDto = await service.instance.findTypeById(`id`)
        resp.json(type)
    }))

    app.post("/managementType/",
        validator.body("name").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        
        run(async(req:Request, resp:Response) => {
            const error =validator.validationResult(req)
            if( error && !error.isEmpty()){
                throw ValidatorUtils.toArgumentsException(error.array())
            }
            const dto = req.body
            const type = await service.instance.createType({
                name: dto["name"]
            })
            resp.json(type)
        })
    )

}