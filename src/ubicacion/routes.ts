import * as service from "./service"
import * as validator from "express-validator"
import {run} from "../common/utils/run"
import {Application, Request, Response} from "express"

import {LocalityDto, ProvinceDto} from "./dto"
import {StringUtils} from "../common/utils/string_utils"
import {ArgumentsException} from "../common/exception/exception"
import {ErrorCode} from "../common/utils/constants"
import {ValidatorUtils} from "../common/utils/validator_utils"

/**
 * 
 * @param {Express} app 
 */
export const route = (app: Application) => {
    /**
     *  Listamos todos los usuarios en el backend.  Esto es solo a fines de la demo
     *  Ademas nos servira para el desarrollo de los otros tickets.
     */
    app.get("/locality/", run(async (req: Request, resp: Response) => {
        //NOTA: tengan cuidado de no olvidar el await. Si omitimos el await
        // la respuesta de backend sería un objeto Promise sin resolver queç
        // se serializa como {}
        const localitys : LocalityDto[] = await  service.instance.getAllLocalities()
        resp.json(localitys)    
    }))
    app.get("/province/", run(async (req: Request, resp: Response) => {
        //NOTA: tengan cuidado de no olvidar el await. Si omitimos el await
        // la respuesta de backend sería un objeto Promise sin resolver queç
        // se serializa como {}
        const province : ProvinceDto[] = await  service.instance.getAllProvinces()
        resp.json(province)    
    }))
    app.post("/province/", 
            validator.body("nameProvince").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),

            run(async (req: Request, resp: Response) =>{
                const errors = validator.validationResult(req)
                if(errors && !errors.isEmpty()){
                    throw ValidatorUtils.toArgumentsException(errors.array())
                }
                const dto = req.body
                const province = await service.instance.createProvince({
                    nameProvince: dto["nameProvince"]
                })
                resp.json(province)    
             }
         )
     )
    app.post("/locality/", 
            validator.body("nameLocality").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),

            run(async (req: Request, resp: Response) =>{
                const errors = validator.validationResult(req)
                if(errors && !errors.isEmpty()){
                    throw ValidatorUtils.toArgumentsException(errors.array())
                }
                const dto = req.body
                const locality = await service.instance.createLocality({
                    nameLocality: dto["nameLocality"]
                })
                resp.json(locality)    
             }
         )
     )
}