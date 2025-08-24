import * as service from "./service"
import * as validator from "express-validator"
import {run} from "../common/utils/run"
import {Application, Request, Response} from "express"

import {ArtistStyleDto, ArtistTypeDto} from "./dto"
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
    app.get("/artistStyle/", run(async (req: Request, resp: Response) => {
        //NOTA: tengan cuidado de no olvidar el await. Si omitimos el await
        // la respuesta de backend sería un objeto Promise sin resolver queç
        // se serializa como {}
        const artistStyles : ArtistStyleDto[] = await  service.instance.getAllArtistStyles()
        resp.json(artistStyles)    
    }))
    app.get("/artistType/", run(async (req: Request, resp: Response) => {
        //NOTA: tengan cuidado de no olvidar el await. Si omitimos el await
        // la respuesta de backend sería un objeto Promise sin resolver queç
        // se serializa como {}
        const artistType : ArtistTypeDto[] = await  service.instance.getAllArtistTypes()
        resp.json(artistType)    
    }))
    app.post("/artistType/", 
            validator.body("nameArtistType").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),

            run(async (req: Request, resp: Response) =>{
                const errors = validator.validationResult(req)
                if(errors && !errors.isEmpty()){
                    throw ValidatorUtils.toArgumentsException(errors.array())
                }
                const dto = req.body
                const artistType = await service.instance.createArtistType({
                    nameArtistType: dto["nameArtistType"]
                })
                resp.json(artistType)    
             }
         )
     )
    app.post("/artiststyle/", 
            validator.body("nameArtistStyle").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
            validator.body("idArtistType").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
            run(async (req: Request, resp: Response) =>{
                const errors = validator.validationResult(req)
                if(errors && !errors.isEmpty()){
                    throw ValidatorUtils.toArgumentsException(errors.array())
                }
                const dto = req.body
                const artistStyle = await service.instance.createArtistStyle({
                    nameArtistStyle: dto["nameArtistStyle"],
                    idArtistType: dto["idArtistType"]
                })
                resp.json(artistStyle)    
             }
         )
     )
}