import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';


/**
 * Middleware genérico para validar el cuerpo de la solicitud (req.body)
 * contra una clase DTO específica.
 * @param dtoClass La clase DTO (e.g., CreatePagoMPDto) a validar.
 */
export function validateDto<T extends object>(dtoClass: { new(...args: any[]): T }) {
  
  return async (req: Request, res: Response, next: NextFunction) => {
    
    // 1. Transformar el cuerpo plano (req.body) a una instancia del DTO
    const dtoInstance = plainToInstance(dtoClass, req.body, { 
      // Opciones: Habilita el tipado y la transformación automática
      enableImplicitConversion: true 
    });
    
    // 2. Aplicar la validación
    const errors: ValidationError[] = await validate(dtoInstance);

    if (errors.length > 0) {
      // 3. Formatear y enviar la respuesta 400 Bad Request
      
      const formattedErrors = errors.map(error => {
        // Recorre todos los constraints (reglas fallidas)
        const constraints = error.constraints ? Object.values(error.constraints) : [];
        return {
          field: error.property,
          messages: constraints
        };
      });

      // 🛑 Detiene la ejecución y envía la respuesta de error 400
      return res.status(StatusCodes.BAD_REQUEST || 400).json({
        statusCode: StatusCodes.BAD_REQUEST || 400,
        error: 'Validation Failed',
        message: 'Los datos proporcionados no son válidos.',
        details: formattedErrors
      });
    }
    
    // 4. Si la validación es exitosa, adjuntar la instancia tipada al request
    (req as any).validatedBody = dtoInstance;

    next();
  };
}