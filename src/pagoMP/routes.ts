import { Application , Response, Request} from "express";
import { auth } from "../server/middleware";
import { validateDto } from "../common/utils/validatorsBody";
import { PagoMpDto } from "./dto";
import { run } from "../common/utils/run";
import *  as service from "./service"
import * as reservaService  from "../reservation/service";
import * as salaService  from "../sala_de_ensayo/service";
import { Pago } from "../pago/model";
import * as validator from "express-validator"
import { ErrorCode } from "../common/utils/constants";
import { ValidatorUtils } from "../common/utils/validator_utils";
import { preferenceClient } from "../configuracion/mercadopago";

export const route =(app: Application)=>{

    app.post("/pagos/webhook",
        run(async(req: Request, resp: Response)=>{
            try {
                console.log('🔔 Webhook recibido de Mercado Pago');
                const query = req.query;
                console.log('Query Params:', query);
                console.log('Body:', req.body);
                const topic = query.topic as string;
                const paymentId = query.id as string;
                // IMPORTANTE: Mercado Pago espera una respuesta rápida
                // Procesamos de forma asíncrona pero respondemos inmediatamente
                resp.status(200).send('OK');
                
                // Procesar la notificación en segundo plano
                setTimeout(async () => {
                    try {
                    await service.instance.createPagoMp(req.body, topic, paymentId);
                    } catch (error) {
                    console.error('Error en procesamiento asíncrono:', error);
                    }
                }, 0);

                } catch (error) {
                    console.error('💥 Error en webhook:', error);
                    // Aún así respondemos OK para que MP no reintente inmediatamente
                    resp.status(200).send('OK');
                }
            }
        )
    )
    
    
    app.post("/pagos/createPreference",
        auth,
        validator.body("idRoom").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("idOwner").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED), 
        //validator.body("idUser").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("hsStart").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("hsEnd").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("date").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        validator.body("totalPrice").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
        
        
        run(async(req: any, resp: Response)=>{
            console.log("ruta pagos/createPreference/")
            console.log("body: ", req.body)
            const errors = validator.validationResult(req)
            if(errors && !errors.isEmpty()){
                throw ValidatorUtils.toArgumentsException(errors.array())
            } 
            const user = req.user
            const {reservaId,  ...dto} = req.body

            try {
                 //buscar Sala de ensayo
                const room = await salaService.instance.findSalaById(dto.idRoom)
                if(!room) {
                    throw new Error("Tuvimos un problema, intentalo nuevamente mas tarde")
                }

                // crear reserva con estado en_proceso de pago
                const reservaDto ={
                    idRoom: dto.idRoom,
                    idUser: req.user.id,
                    idOwner: dto.idOwner,
                    hsStart: dto.hsStart,
                    hsEnd: dto.hsEnd,
                    date: dto.date,
                    totalPrice: dto.totalPrice,
                    canceled: "false",
                    paymentStatus: "PENDIENTE"
                }
                
                const paymentUrl = await service.instance.createPreference(reservaDto)

                resp.status(201).json({
                    success: true,
                    message: "Reserva pendiente de pago creada con exito",
                    paymentUrl: paymentUrl // Exactamente lo que retorna tu servicio
                });
            } catch (error) {
                console.error('Error en createReservation:', error);
      
                // Manejar errores específicos de TU servicio
                if (error instanceof Error) {
                    if (error.message.includes('No se pudo crear la reserva')) {
                    resp.status(400).json({
                        success: false,
                        error: error.message
                    });
                    return;
                    }
                }

                resp.status(500).json({
                success: false,
                error: 'No se pudo procesar la reserva'
            });

            }

        })

    )

    app.post("/pagosMp/create", 
        auth,
        validateDto(PagoMpDto),
        
        run(async( req: any, resp: Response) => {
            const topic = req.query.topic as string;
            const paymentId = req.query.id as string;
            const dto: PagoMpDto = req.validatedBody;
            //const id = req.user.id 
            dto.id = req.user.id
            const pagoCreated = await service.instance.createPagoMp(dto, topic, paymentId)
            resp.json(pagoCreated)
        })
    )

}