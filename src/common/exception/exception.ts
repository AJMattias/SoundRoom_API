import {Response} from "express"

interface IArgumentsError{
    field: string;
    code: string;
}

export class BaseException extends Error{
    code: number;
    error: string;
    errorCode: string;
    /**
     *  Representa una excepcion de negocio propia de nuestra app.
     *  Esta clase sera extendida por excepciones propias de nuestro negocio, por ejemplo, AuthenticationException
     *  @param {Int} code
     *  @param {String} error
     *  @param {String} message
     */
    constructor(code: number, error: string, message: string) {
        super(`${error} : ${message}`)
        this.error = error
        this.code = code
        this.message = message
        this.errorCode = error
    }

    /**
     * 
     * @param {Response} res 
     */
     send(res: Response){
        res.status(this.code).json(this)
    }
}
/**
 * Representa que el usuario no está logueado e intentó acceder a un recurso que requiere de autenticación.
 */
export class AuthenticationException extends BaseException{
    constructor(){
        super(401,"AUTH_REQUIRED","You need to be authenticated.")
    }
}
/**
 * Representa que el usuario esta logueado pero no tiene permisos para lo que quiere realizar.
 */
export class AuthorizationException extends BaseException {
    constructor(){
        super(403,  "NOT_AUTHORIZED", "You are not authorized to perform this action.")
    }
}
/**
 *  Representa un error generico del sistema
 */
export class ServerException extends BaseException {
    constructor(){
        super(500, "SERVER_ERROR", "There is a problem with the server.")
    }
}
/**
 *  Representa que el cliente envio mal unos parametros . Agrega un diccionario de los campos invalidos.
 */
export class ArgumentsException extends BaseException {
    arguments?: IArgumentsError[]
    constructor(args?: IArgumentsError[]) {
        super(400, "ARGUMENTS_ERROR", "The arguments suplied are wrong")
        this.arguments = args
    }
}

/**
 * Representa un tipo de error de negocio generico
 */
export class BadRequestException extends BaseException{
    /**
     * Representa un error de negocio
     * @param {String} errorCode codigo de error asociado con
     * el error de negocio ocurrido
     * @param {String} details mensaje legible sobre el error ocurrido
     */
    details?: string;
    constructor(errorCode: string , details?: string){
        super(400, "BAD_REQUEST", "Bad request")
        this.errorCode = errorCode
        this.details = details
    }
}


/**
 *  Representa que el cliente envió demasiadas solicitudes en una ventana de tiempo, y le denegamos temporalmente el servicio. 
 */
export class ApiQuotaException extends BaseException {
    time: number;
    details: string;
    constructor(time?:number){
        super(403, "API_QUOTA_EXCEEDED","You exceeded the maximum requests allowed in this period.")
        this.time = time? time : 1000
        this.details = `You exceeded the maximum requests allowed. Please wait for ${this.time/1000} seconds and try again.`
    }
}

export class NotFoundException extends BaseException {
    constructor(){
        super(404, "NOT_FOUND", "The resource that you are looking for doesn't exists")
    }
}

/**
 *  Representa que no se encontro una determinada entidad en Base de Datos.
 *  Suele largarse a nivel DAO , por ejemplo, si se busca una entidad inexistente.
 *  La hacemos una clase diferente para poder catcharla en algun  servicio si hace falta, 
 *  ya que NotFoundException correspondería más a la capa de transporte.
 */
export class ModelNotFoundException extends NotFoundException {

}

export class DuplicatedKeyException extends BadRequestException{
    constructor(){
        super("ENTITY_ALREADY_EXISTS", "The resource you're trying to create already exists")
    }
}



/**
 *  Representa un error de base de datos.
 *  Puede ser un  error de lectura o escritura de datos, siempre se produce en los DAOs
 */
export class DatabaseException extends Error {
    /**
     * @param {Error} error  el error que produjo la excepcion
     */
    constructor(error: Error){
        super(error.message)
        super.stack = error.stack
    }
}
