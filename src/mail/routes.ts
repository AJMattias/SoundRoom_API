import { Application, Request, Response } from "express"
import { run } from "../common/utils/run"
import { auth } from "../server/middleware"
import { mailService } from "./service"
import * as validator from "express-validator"

export const route = (app: Application) => {
    app.post(
        "/email/send/",
        auth,
        validator.body("message").notEmpty(),
        validator.body("to").isEmail(),
        run(async (req: Request, resp: Response) => {
           await mailService.sendMessage(req.body.to, req.body.message)
           resp.send({result: 'msj enviado'})
        })
    )
}