import { Application, Request, Response } from "express";
import { run } from "../common/utils/run";
import { auth } from "../server/middleware";
import * as validator from "express-validator"
import {ErrorCode} from "../common/utils/constants"
import { ValidatorUtils } from "../common/utils/validator_utils";
import { PagoModel } from "./model";

export const route = (app: Application) =>{

    app.post("/pago/create/", 
        auth,
        //validator.body("idUser").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("idSala").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("idReservation").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("name").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("ccv").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("numeroTarjeta").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("fechaVencimiento").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),

        run(async( req: any, resp: Response)=>{
            const errors = validator.validationResult(req)
                    if(errors && !errors.isEmpty()){
                        throw ValidatorUtils.toArgumentsException(errors.array())
                    }

            const dto = req.body
            const idUser = req.user.id
            //const email = req.user.email
            console.log('route dto receive: ', dto)
            const pagoCreated = await PagoModel.create({
                idUser: idUser,
                idSala: dto["idSala"],
                idReservation: dto["idReservation"],
                name: dto["name"], 
                ccv: dto["ccv"], 
                numeroTarjeta: dto["numeroTarjeta"],
                fechaVencimiento: dto["fechaVencimiento"],
                createdAt: new Date()
            }
            )

            resp.json(pagoCreated)

        })
    )


}