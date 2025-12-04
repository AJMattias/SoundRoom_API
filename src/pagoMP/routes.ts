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
import { WebhookUtils } from "./webhook-utils";
import { TEMPORARY_REDIRECT } from "http-status-codes";

export const route =(app: Application)=>{

    // app.post("/pagos/webhooks",
    //     run(async(req: Request, resp: Response)=>{
    //         try {
    //             console.log('🔔 Webhook recibido de Mercado Pago');
    //             const query = req.query;
    //             console.log('Query Params:', query);
    //             console.log('Body:', req.body);
    //             const topic = query.topic as string;
    //             const paymentId = query.id as string;
    //             // IMPORTANTE: Mercado Pago espera una respuesta rápida
    //             // Procesamos de forma asíncrona pero respondemos inmediatamente
    //             resp.status(200).send('OK');
                
    //             // Procesar la notificación en segundo plano
    //             setTimeout(async () => {
    //                 try {
    //                 await service.instance.createPagoMp(req.body, topic, paymentId);
    //                 } catch (error) {
    //                 console.error('Error en procesamiento asíncrono:', error);
    //                 }
    //             }, 0);

    //             } catch (error) {
    //                 console.error('💥 Error en webhook:', error);
    //                 // Aún así respondemos OK para que MP no reintente inmediatamente
    //                 resp.status(200).send('OK');
    //             }
    //         }
    //     )
    // )

    app.post("/pagos/webhooks",
        run(async(req: Request, resp: Response) => {
            try {
                console.log('='.repeat(60));
                console.log('🔔 WEBHOOK RECIBIDO - MERCADO PAGO');
                console.log('='.repeat(60));
                
                // 1. Extraer datos
                const query = req.query;
                const body = req.body;
                const headers = req.headers;
                
                // Log para debugging
                console.log('📌 URL completa:', req.originalUrl);
                console.log('📌 Headers:', {
                    'x-signature': (headers['x-signature'] as string)?.substring(0, 50) + '...',
                    'x-request-id': headers['x-request-id']
                });
                console.log('📌 Query params:', query);
                console.log('📌 Body:', JSON.stringify(body, null, 2));
                
                // 2. Respuesta inmediata a Mercado Pago
                // IMPORTANTE: Esto no detiene la ejecución, solo envía la respuesta
                resp.status(200).send('OK');
                
                // 3. Procesamiento ASÍNCRONO después de responder
                setTimeout(async () => {
                    try {
                        const webhookUtils = new WebhookUtils();
                        
                        // Obtener resourceId de diferentes fuentes posibles
                        let resourceId = '';
                        if (query.id) {
                            resourceId = query.id as string;
                        } else if (body.resource) {
                            resourceId = body.resource;
                        } else if (body.id) {
                            resourceId = body.id;
                        } else if (body.data?.id) {
                            resourceId = body.data.id;
                        }
                        
                        console.log('🔍 Resource ID identificado:', resourceId);
                        
                        // 4. Validar autenticidad del webhook
                        const isValid = await webhookUtils.validateWebhookAuthenticity(
                            headers as Record<string, string>,
                            resourceId,
                            query
                        );
                        
                        if (!isValid) {
                            console.error('❌ Webhook NO autenticado. No se procesará.');
                            
                            // // Registrar intento fallido (opcional)
                            // await logFailedWebhook({
                            //     url: req.originalUrl,
                            //     query: query,
                            //     body: body,
                            //     headers: headers,
                            //     reason: 'Firma inválida',
                            //     timestamp: new Date()
                            // });
                            
                            return;
                        }
                        
                        console.log('✅ Webhook autenticado correctamente');
                        
                        // 5. Determinar tipo de evento
                        const eventType = webhookUtils.determineEventType(
                            query.topic as string,
                            body
                        );
                        
                        console.log('🎯 Tipo de evento:', eventType);
                        
                        // 6. Procesar según tipo de evento
                        if (eventType === 'payment' && resourceId) {
                            // Para pagos, obtener el ID correcto
                            const paymentId = resourceId;
                            
                            console.log(`💰 Procesando pago ID: ${paymentId}`);
                            
                            // Llamar al servicio para procesar el pago
                            await service.instance.createPagoMp({
                                type: query.topic as string, 
                                rawBody: body,
                                queryParams: query,
                                webhookHeaders: headers,
                                eventType: eventType,
                                validated: true,
                                receivedAt: new Date()
                            }, query.topic as string, paymentId);
                            
                            console.log(`✅ Pago ${paymentId} procesado exitosamente`);
                            
                        } else if (eventType === 'merchant_order') {
                            console.log('🛒 Procesando orden de compra:', resourceId);
                            // Aquí tu lógica para órdenes
                            // await service.instance.procesarOrden(resourceId, body);
                            
                        } else {
                            console.warn(`⚠️ Evento no manejado: ${eventType}`);
                            console.log('Body recibido:', JSON.stringify(body, null, 2));
                        }
                        
                    } catch (error) {
                        console.error('💥 Error en procesamiento asíncrono:', error);
                        
                        // Registrar error (opcional)
                        // await logWebhookError({
                        //     url: req.originalUrl,
                        //     error: error instanceof Error ? error.message : String(error),
                        //     stack: error instanceof Error ? error.stack : undefined,
                        //     timestamp: new Date()
                        // });
                    }
                }, 0); // setTimeout con 0 para ejecutar en el próximo tick del event loop
                
                console.log('📤 Respuesta 200 enviada a Mercado Pago');
                console.log('🔄 Procesamiento asíncrono iniciado');
                console.log('='.repeat(60));
                
            } catch (error) {
                console.error('💥 Error en handler principal de webhook:', error);
                // Aún así respondemos OK para que MP no reintente inmediatamente
                resp.status(200).send('OK');
            }
        })
    );

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