import { PagoModel } from "../pago/model";
import { CreateReservaDto } from "../reservation/dto";
import { ReservationModel } from "../reservation/model";
import { CreatePreferenceRequest, PagoMpDto, PreferenceItem } from "./dto";
import { EstadoPagos } from "./enum";
import { IPagoMP, PagoMPDoc, PagoMPModel } from "./model";
import * as MercadoPagoService from "../configuracion/mercadopago";
import { preferenceClient, paymentClient, merchantOrderClient  } from '../configuracion/mercadopago';
import * as Email from "../server/MailCtrl"
import { Types } from "mongoose";
import { UserModel } from "../users/models";


export class PagoMPService{;

    mapToPagoMP(document: PagoMPDoc): PagoMpDto{
        return{
            id: (document._id as unknown) as string,
            monto: document.monto,
            metodoPago: document.metodoPago,
            estado: document.estado,
            nroTransaccion: document.nroTransaccion,
            usuario: document.usuario,
            available: document.available,
            reserva: document.reserva,
            collectionId: document.collectionId,
            collectionStatus: document.collectionStatus,
            externalReference: document.externalReference,
            merchantAccountId: document.merchantAccountId,
            merchantOrderId: document.merchantOrderId,
            paymentId: document.paymentId,
            preferenceId: document.preferenceId,
            processingMode: document.processingMode,
            siteId: document.siteId,
            paymentType: document.paymentType,
            status: document.status,
            
        }
    }
    

    async createPreference(reservaDto: CreateReservaDto): Promise<string> {
        let reserva
        try {
            const reservationDate = new Date(reservaDto.date).toLocaleDateString('es-ES');
            console.log('Creating preference for reservation on date:', reservationDate);

            // Crear reserva con payment status pendiente:
            reserva = new ReservationModel({
                ...reservaDto,
                payment_status: 'PENDIENTE',
                createdAt: new Date(),
                date: reservationDate
            });
            const reservaGuardada = await reserva.save()
            console.log('preference- reservaGuardada', reservaGuardada);

            if (!reservaGuardada) throw new Error("No se pudo crear la reserva para generar el pago")

            const unitPriceWithTax = Number((reservaDto.totalPrice * 1.2).toFixed(2));
            // Crear el item para la preferencia
            const item={
                id: reservaGuardada._id.toString(),
                title: `Reserva de Sala de Ensayo - ${reservaDto.date}`,
                unit_price: unitPriceWithTax,
                quantity: 1,
                currency_id: 'ARS',
                description: `Reserva para el ${reservationDate} de ${reservaDto.hsStart} a ${reservaDto.hsEnd}`,
                category_id: 'services'
            };
            console.log('preference item: ', item);
            const reservationItem: PreferenceItem = {
                id: reservaGuardada._id.toString(),
                title: `Reserva de Sala de Ensayo`,
                unit_price: unitPriceWithTax,
                quantity: 1,
                currency_id: 'ARS',
                description: `Reserva para el ${reservationDate} de ${reservaDto.hsStart} a ${reservaDto.hsEnd}`,
                category_id: 'services'
            };
        
            //guardar solo id reserva
            const externalReference = reservaGuardada._id.toString();

            const preferenceData: CreatePreferenceRequest = {
                items: [reservationItem],
                external_reference: externalReference,
                back_urls: {
                    success: `${process.env.FRONTEND_URL}/reservas/pago-exitoso/${reservaDto.idRoom}/${reservaGuardada._id.toString()}`,
                    failure: `${process.env.FRONTEND_URL}/reservas/pago-fallido`,
                    pending: `${process.env.FRONTEND_URL}/reservas/pago-pendiente`
                },
                auto_return: 'approved',
                //notification_url: 'undefined/api/pagos/webhook',
                notification_url: `${process.env.BACKEND_URL}/pagos/webhooks`,
                expires: true,
                expiration_date_from: new Date().toISOString(),
                expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString()
            };

            const preference = await preferenceClient.create({ body: preferenceData });
            console.log('preference complete: ', preferenceData)
            console.log('preference.sandbox_init_point', preference.sandbox_init_point);
            
            return preference.sandbox_init_point!;

        } catch (error) {
            //borrar reserva en caso de error    
            await ReservationModel.findByIdAndDelete(reserva?._id);
            console.error('Error creando preferencia de pago:', error);
            throw new Error('No se pudo crear la preferencia de pago');
        }
    }

    private mapPaymentStatus(mpStatus: string): string {
        const statusMap: { [key: string]: string } = {
        'approved': 'CONFIRMADA',
        'pending': 'PENDIENTE',
        'in_process': 'EN_PROCESO', 
        'rejected': 'RECHAZADA',
        'cancelled': 'CANCELADA',
        'refunded': 'REEMBOLSADA',
        'charged_back': 'CONTESTADA'
        };

        return statusMap[mpStatus] || 'PENDIENTE';
    }

    // usando externale reference para actualizar pago, crear pagoMP y actualizar reserva
    async createPagoMp(createPagoMp:any, topic: string, paymentId: string):Promise<any>{
        try {
            console.log('🔔 Procesando notificación:', createPagoMp);

            const { type, ...data} = createPagoMp;
            if (topic !== 'payment') {
                throw new Error('Tipo de notificación no soportado');
            }

            //obtener los detalles de payment
            const paymentDetails = await paymentClient.get({id: paymentId.toString()});
            
            //buscar reserva por external reference
            console.log('buscar reserva por external reference: ', paymentDetails.external_reference);
            const reserva = await ReservationModel.findById(paymentDetails.external_reference).exec();
            
            if (!reserva) {
                throw new Error('No se encontró la reserva asociada al pago');
            }
            const user = await ReservationModel.findById(reserva.idUser).exec();
            if(!user){
                throw new Error('No se encontró el usuario asociado a la reserva');
            }
            const owner = await ReservationModel.findById(reserva.idOwner).exec();
            if(!owner){
                throw new Error('No se encontró el propietario asociado a la reserva');
            }

            console.log('💰 Detalles del pago obtenidos:', {
                id: paymentDetails.id,
                status: paymentDetails.status,
                external_reference: paymentDetails.external_reference
            });

            //const externalReferenceParsed = JSON.parse(paymentDetails.external_reference || '{}');

            if(paymentDetails.status){
                const reservationStatus = this.mapPaymentStatus(paymentDetails.status);
            }

            // Procesar el pago y actualizar la reserva
            const reservaUpdated =await ReservationModel.findOneAndUpdate(
                { _id: reserva.id },
                { payment_status: paymentDetails.status?.toUpperCase(),paymentDate: new Date() },
                {new: true}
            );

            const pago = new PagoMPModel(createPagoMp)
            const pagoGuardado = await pago.save()
            if(!pagoGuardado){
                throw new Error('No se pudo guardar el pago en la base de datos');
            }

            //email a artista
            await this.sendMailPiola(user.email, `Ud ha creado con exito la reserva para el dia ${reservaUpdated.date} a las ${reservaUpdated.hsStart} hasta las ${reservaUpdated.hsFin}. Gracias por elegir SoundRoom.`)
            await this.sendMailPiola(owner.email, `Sea ha creado una reserva para el dia ${reservaUpdated.date} a las ${reservaUpdated.hsStart} hasta las ${reservaUpdated.hsFin} a una de sus salas de ensayo. Gracias por elegir SoundRoom.`)

        } catch (error) {
            console.error('💥 Error procesando notificación:', error);
            throw error;
        }
        
        return {status: 200, msg:'Pago procesado correctamente'};
    }

    async createPagoMpMerchant(createPagoMp: any, topic: string, id: string): Promise<any> {
        try {
            console.log('🔔 Procesando notificación merchant_order:', { id, topic });

            if (topic !== 'merchant_order') {
                throw new Error('Tipo de notificación no soportado');
            }

            // 1. Obtener merchant order
            const merchantOrder = await merchantOrderClient.get({ merchantOrderId: id.toString() });
            
            if (!merchantOrder.id) {
                throw new Error('Merchant order sin ID');
            }

            console.log('📦 Merchant Order obtenida:', {
                id: merchantOrder.id,
                status: merchantOrder.status,
                external_reference: merchantOrder.external_reference,
                payments_count: merchantOrder.payments?.length || 0,
                total_amount: merchantOrder.total_amount,
                paid_amount: merchantOrder.paid_amount
            });

            // 2. Buscar reserva
            if (!merchantOrder.external_reference) {
                throw new Error('Merchant order sin external_reference');
            }

            const reserva = await ReservationModel.findById(merchantOrder.external_reference).exec();
            if (!reserva) {
                throw new Error(`No se encontró la reserva: ${merchantOrder.external_reference}`);
            }

            // 3. Buscar usuario y propietario
            const user = await UserModel.findById(reserva.idUser).exec();
            const owner = await UserModel.findById(reserva.idOwner).exec();
            
            if (!user || !owner) {
                throw new Error('Usuario o propietario no encontrado');
            }

            // 4. Manejar caso SIN pagos
            if (!merchantOrder.payments || merchantOrder.payments.length === 0) {
                console.log('🔄 Merchant order sin pagos. Actualizando estado a PENDIENTE');
                
                await ReservationModel.findByIdAndUpdate(
                    merchantOrder.external_reference,
                    { 
                        payment_status: 'PENDIENTE',
                        merchant_order_id: merchantOrder.id.toString(),
                        last_webhook_update: new Date()
                    }
                );
                
                return { 
                    status: 200, 
                    msg: 'Orden recibida sin pagos',
                    estado: 'PENDIENTE'
                };
            }

            // 5. Procesar cada pago (CORREGIDO con propiedades correctas)
            console.log(`💰 Procesando ${merchantOrder.payments.length} pago(s)`);
            
            let pagoAprobado = false;
            const pagosGuardados = [];

            for (const payment of merchantOrder.payments) {
                // Validar que el pago tenga ID
                if (!payment.id) {
                    console.warn('⚠️ Pago sin ID, saltando...');
                    continue;
                }

                console.log(`💳 Procesando pago ${payment.id}, estado: ${payment.status}`);

                // Crear objeto con las propiedades CORRECTAS
                const pagoData: any = {
                    // Campos requeridos de tu schema
                    monto: payment.transaction_amount || payment.total_paid_amount || 0,
                    metodoPago: 'mercadopago', // Por defecto, ya que merchant order no tiene payment_method_id
                    estado: this.mapPaymentStatusToEstado(payment.status || 'pending'),
                    nroTransaccion: payment.id.toString(),
                    usuario: user._id.toString(),
                    reserva: reserva._id.toString(),
                    available: true,
                    
                    // Campos MP (algunos pueden quedar null)
                    collectionId: payment.id.toString(), // Usamos payment.id como collectionId
                    collectionStatus: payment.status || '',
                    externalReference: merchantOrder.external_reference || '',
                    merchantAccountId: '', // merchant_order no tiene este campo
                    merchantOrderId: merchantOrder.id?.toString() || '',
                    paymentId: payment.id.toString(),
                    preferenceId: merchantOrder.preference_id || '',
                    processingMode: '', // merchant_order no tiene este campo
                    siteId: merchantOrder.site_id || '',
                    paymentType: '', // merchant_order no tiene payment_type_id
                    status: payment.status || ''
                };

                // Si necesitas más detalles del pago, debes obtenerlo con paymentClient
                try {
                    const paymentDetails = await paymentClient.get({ id: payment.id.toString() });
                    // Ahora SÍ tienes accesso a payment_method_id, etc.
                    pagoData.metodoPago = paymentDetails.payment_method_id || 'mercadopago';
                    pagoData.paymentType = paymentDetails.payment_type_id || '';
                    pagoData.processingMode = paymentDetails.processing_mode || '';
                    
                    // Copiar otros campos disponibles
                    if (paymentDetails.collector_id) {
                        pagoData.collectionId = paymentDetails.collector_id.toString();
                    }
                    if (paymentDetails.merchant_account_id) {
                        pagoData.merchantAccountId = paymentDetails.merchant_account_id.toString();
                    }
                    
                } catch (error: any) {
                    console.error('💥 Error en createPagoMpMerchant:', error?.message || error);
                    return { status: 500, msg: error?.message || 'Error interno' };
                }

                // Guardar pago
                try {
                    const pago = new PagoMPModel(pagoData);
                    const pagoGuardado = await pago.save();
                    pagosGuardados.push(pagoGuardado._id);
                    console.log(`✅ Pago ${payment.id} guardado con ID: ${pagoGuardado._id}`);

                    // Verificar si está aprobado
                    if (payment.status === 'approved') {
                        pagoAprobado = true;
                    }
                } catch (error) {
                    console.error(`❌ Error guardando pago ${payment.id}:`, error);
                }
            }

            // 6. Actualizar estado de la reserva
            if (pagoAprobado) {
                console.log('✅ Pago APROBADO encontrado. Actualizando reserva a PAGADA');
                
                await ReservationModel.findByIdAndUpdate(
                    reserva._id,
                    { 
                        payment_status: 'PAGADA',
                        paymentDate: new Date(),
                        merchant_order_id: merchantOrder.id.toString(),
                        payment_id: merchantOrder.payments.find(p => p.status === 'approved')?.id?.toString()
                    }
                );

                // Enviar emails
                await this.sendMailPiola(
                    user.email, 
                    `Reserva confirmada para ${reserva.date} ${reserva.hsStart}-${reserva.hsEnd}`
                );
                
                await this.sendMailPiola(
                    owner.email, 
                    `Nueva reserva para ${reserva.date} ${reserva.hsStart}-${reserva.hsEnd}`
                );

            } else if (merchantOrder.payments.length > 0) {
                // Actualizar con estado del último pago
                const lastPayment = merchantOrder.payments[merchantOrder.payments.length - 1];
                const status = lastPayment.status?.toUpperCase() || 'PENDIENTE';
                
                console.log(`ℹ️ Actualizando reserva a: ${status}`);
                
                await ReservationModel.findByIdAndUpdate(
                    reserva._id,
                    { 
                        payment_status: status,
                        merchant_order_id: merchantOrder.id.toString(),
                        last_webhook_update: new Date()
                    }
                );
            }

            console.log(`✅ Procesamiento completado. ${pagosGuardados.length} pago(s) guardado(s)`);
            return { 
                status: 200, 
                msg: 'Procesado correctamente',
                pagos_guardados: pagosGuardados.length,
                reserva_estado: pagoAprobado ? 'PAGADA' : 'PENDIENTE'
            };

        } catch (error) {
            console.error('💥 Error procesando notificación:', error);
            throw error;
        }
    }

    // Función auxiliar para mapear estados de MP a tu Enum
    private mapPaymentStatusToEstado(status: string): string {
        const statusMap: { [key: string]: string } = {
            'pending': 'EN_PROCESO',
            'approved': 'APROBADO',
            'authorized': 'AUTORIZADO',
            'in_process': 'EN_PROCESO',
            'in_mediation': 'EN_MEDIACION',
            'rejected': 'RECHAZADO',
            'cancelled': 'CANCELADO',
            'refunded': 'REEMBOLSADO',
            'charged_back': 'CONTRA_CARGO'
        };
        
        return statusMap[status] || 'EN_PROCESO';
    }

    async sendMailPiola(to: string, message: string) {
        const mailOptions = {
            from: 'soundroomapp@gmail.com',
            to: to,
            subject: "Reserva de Sala de ensayo",
            html: '<div id=":pf" class="a3s aiL "><table><tbody> <tr> <td style="padding:16px 24px"> <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%"> <tbody> <tr> <td> <table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="auto"> <tbody> <tr> <td> <img alt="Imagen de SoundRoom" border="0" height="70" width="70" src="https://fs-01.cyberdrop.to/SoundRoom_logo-X6fFVkX9.png" style="border-radius:50%;outline:none;color:#ffffff;max-width:unset!important;text-decoration:none" class="CToWUd"></a></td> </tr> </tbody> </table></td> </tr> <tr> <td> <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" align="center" style="max-width:396px;padding-bottom:4px;text-align:center"> <tbody> <tr> <td><h2 style="margin:0;color:#262626;font-weight:400;font-size:16px;line-height:1.5">' + "Usted ha creado la cuenta exitosamente. Gracias por elegir SoundRoom" + '</h2></td> </tr> </tbody> </table></td> </tr></tbody></table></div>',
            text: message,
            //borrar todo html en caso de que se rompa je
            }
        await Email.sendEmailAsync(mailOptions)
    }
    
    

    async getAllPAgosMp(): Promise<PagoMpDto[] | {message: string}> {
        const pagos = await PagoMPModel.find().exec();
        if(!pagos) return {message: "No hay pagos"}
        return pagos.map(pago => this.mapToPagoMP(pago));
    }

    async getPagoById(id: string): Promise<PagoMpDto | {message: string} > {
        const pago = await PagoModel.findById(id).exec();
        if(!pago) return {message: "No hay pagos"}
        return this.mapToPagoMP(pago)
    }

    async updatePagoMP(updateDto: PagoMpDto): Promise<PagoMpDto | {message: string} > {
        const pagoUpdated = await PagoMPModel.findByIdAndUpdate(updateDto.id, updateDto, { new: true }).exec();
        if(!pagoUpdated) return {message: "No hay pagos"}
        return this.mapToPagoMP(pagoUpdated)    
    }

    async deletePagoMP(id: string): Promise< {message: string}> {
        const pagoEliminado = await PagoMPModel.findByIdAndDelete(id).exec();
        if(!pagoEliminado) return {message: "No existe el pago requerido"}
        return {message: 'Pago eliminado'};
    }

    

    async getPagosMPByUserId(userId: string): Promise<PagoMpDto[] | {message: string}> {
        const pagos = await PagoMPModel.find({ usuario: userId }).exec();
        if(!pagos) return {message: "No hay pagos para usuaio buscado"}
        return pagos.map(pago => this.mapToPagoMP(pago));

    }

    async getPagosMPByReservaId(reservaId: string): Promise<PagoMpDto[] |{message: string}> {
        const pagos = await PagoMPModel.find({ reserva: reservaId }).exec();
        if(!pagos)return {message: "No hay pagos para reserva buscada"}
        return pagos.map(pago => this.mapToPagoMP(pago));
    }

    async updatePagoMPStatus(id: string, newStatus: EstadoPagos): Promise<PagoMpDto | {message: string} > {
        const pagoActualizado = await PagoMPModel.findByIdAndUpdate(
            id,
            { estado: newStatus },
            { new: true }
        ).exec();
        if(!pagoActualizado) return {message: "No existe el pago a actualizar"}
        return this.mapToPagoMP(pagoActualizado);
    }


}

export const instance = new PagoMPService()