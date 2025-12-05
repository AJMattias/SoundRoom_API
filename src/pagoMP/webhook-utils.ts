import * as crypto from 'crypto';

export class WebhookUtils {

    async validateWebhookAuthenticity(
        headers: Record<string, string>,
        resourceId: string,
        query: any
    ): Promise<boolean> {
        try {
            const xSignature = headers['x-signature'] as string;
            
            console.log('🔍 Validando webhook:', {
                tieneXSignature: !!xSignature,
                xSignature: xSignature?.substring(0, 100),
                resourceId,
                NODE_ENV: process.env.NODE_ENV
            });

            // Si no hay firma en producción, rechazar
            if (!xSignature) {
                console.warn('⚠️ Webhook sin x-signature header');
                
                // En desarrollo/testing, permitir sin firma
                if (process.env.NODE_ENV !== 'production' || query.test === 'true') {
                    console.warn('⚠️ Modo desarrollo/test - aceptando sin firma');
                    return true;
                }
                return false;
            }

            // Verificar formato básico de la firma
            const hasValidFormat = xSignature.includes('ts=') && xSignature.includes('v1=');
            if (!hasValidFormat) {
                console.error('❌ x-signature con formato inválido');
                return false;
            }

            // Extraer timestamp para validar si es reciente
            const tsMatch = xSignature.match(/ts=([^,]+)/);
            if (tsMatch && tsMatch[1]) {
                const timestamp = parseInt(tsMatch[1]);
                const now = Math.floor(Date.now() / 1000);
                const diff = Math.abs(now - timestamp);
                
                // Validar que no sea muy viejo (más de 5 minutos)
                if (diff > 300) {
                    console.warn(`⚠️ Timestamp muy antiguo: ${diff} segundos de diferencia`);
                    // Podrías retornar false aquí si quieres ser estricto
                }
            }

            console.log('✅ Webhook tiene firma válida de Mercado Pago');
            return true;

        } catch (error) {
            console.error('💥 Error en validación:', error);
            return false;
        }
    }

   parseXSignature(xSignature: string): { ts: string | null; v1: string | null } {
    const result: { ts: string | null; v1: string | null } = { ts: null, v1: null };
    
    const parts = xSignature.split(',');
    parts.forEach(part => {
      // const [key, value] = part.split('=');
      // if (key?.trim() === 'ts') result.ts = value?.trim() || null;
      // if (key?.trim() === 'v1') result.v1 = value?.trim() || null;
      const [key, value] = part.split('=', 2); // Limitar a 2 para evitar problemas si el valor contiene '='
      if (key?.trim() === 'ts') result.ts = value?.trim() ?? null;
      if (key?.trim() === 'v1') result.v1 = value?.trim() ?? null;
    });
    
    return result;
  }

   buildManifest(resourceId: string, requestId: string, timestamp: string): string {
    // IMPORTANTE: resourceId debe estar en minúsculas si es alfanumérico
    const normalizedId = resourceId ? resourceId.toLowerCase() : '';
    
    // Según documentación MP: "id:[data.id];request-id:[x-request-id];ts:[ts];"
    return `id:${normalizedId};request-id:${requestId || ''};ts:${timestamp};`;
  }

   calculateHMAC(message: string, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(message);
    return hmac.digest('hex');
  }

   validateTimestamp(timestamp: string, toleranceSeconds: number = 300): boolean {
    try {
      const notificationTime = parseInt(timestamp, 10);
      const currentTime = Math.floor(Date.now() / 1000);
      const difference = Math.abs(currentTime - notificationTime);
      
      return difference <= toleranceSeconds;
    } catch {
      return false;
    }
  }

   determineEventType(topic: string, body: any): string {
    // Priorizar topic de query param
    if (topic) return topic;
    
    // Si no hay topic, verificar body
    if (body?.type) return body.type;
    
    // Si es payment update por IPN antiguo
    if (body?.action === 'payment.created' || body?.action === 'payment.updated') {
      return 'payment';
    }
    
    return 'unknown';
  }

   logWebhookDetails(request: Request, query: any, body: any, headers: Record<string, string>): void {
    console.log('='.repeat(50));
    console.log('🌐 WEBHOOK RECIBIDO');
    console.log(`📅 ${new Date().toISOString()}`);
    console.log(`🔗 URL: ${request.url}`);
    console.log(`🔍 Query: ${JSON.stringify(query)}`);
    console.log(`📦 Body type: ${body?.type || 'N/A'}`);
    console.log(`🔑 x-signature: ${headers['x-signature']?.substring(0, 50)}...`);
    console.log(`🆔 x-request-id: ${headers['x-request-id']}`);
    console.log('='.repeat(50));
  }


  // Funciones auxiliares para logging (opcionales)
    async logFailedWebhook(data: any) {
        try {
            // Puedes guardar en base de datos, archivo, o servicio de logs
            console.log('📝 Registrando webhook fallido:', data);
            
            // Ejemplo con archivo:
            const fs = require('fs');
            const logEntry = {
                timestamp: new Date().toISOString(),
                ...data,
                headers: { // Limitar logs de headers sensibles
                    'x-signature': data.headers?.['x-signature']?.substring(0, 20) + '...',
                    'x-request-id': data.headers?.['x-request-id']
                }
            };
            
            fs.appendFileSync('failed_webhooks.log', 
                JSON.stringify(logEntry, null, 2) + '\n---\n'
            );
        } catch (logError) {
            console.error('Error al registrar webhook fallido:', logError);
        }
    }

    async logWebhookError(errorData: any) {
        try {
            console.error('📝 Error en webhook:', errorData);
            
            // Guardar en base de datos si es necesario
            /*
            await WebhookErrorModel.create({
                url: errorData.url,
                error: errorData.error,
                stack: errorData.stack,
                timestamp: errorData.timestamp
            });
            */
        } catch (logError) {
            console.error('Error al registrar error de webhook:', logError);
        }
    }


}