"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseException = exports.DuplicatedKeyException = exports.ModelNotFoundException = exports.NotFoundException = exports.ApiQuotaException = exports.BadRequestException = exports.ArgumentsException = exports.ServerException = exports.AuthorizationException = exports.AuthenticationException = exports.BaseException = void 0;
class BaseException extends Error {
    /**
     *  Representa una excepcion de negocio propia de nuestra app.
     *  Esta clase sera extendida por excepciones propias de nuestro negocio, por ejemplo, AuthenticationException
     *  @param {Int} code
     *  @param {String} error
     *  @param {String} message
     */
    constructor(code, error, message) {
        super(`${error} : ${message}`);
        this.error = error;
        this.code = code;
        this.message = message;
        this.errorCode = error;
    }
    /**
     *
     * @param {Response} res
     */
    send(res) {
        res.status(this.code).json(this);
    }
}
exports.BaseException = BaseException;
/**
 * Representa que el usuario no está logueado e intentó acceder a un recurso que requiere de autenticación.
 */
class AuthenticationException extends BaseException {
    constructor() {
        super(401, "AUTH_REQUIRED", "You need to be authenticated.");
    }
}
exports.AuthenticationException = AuthenticationException;
/**
 * Representa que el usuario esta logueado pero no tiene permisos para lo que quiere realizar.
 */
class AuthorizationException extends BaseException {
    constructor() {
        super(403, "NOT_AUTHORIZED", "You are not authorized to perform this action.");
    }
}
exports.AuthorizationException = AuthorizationException;
/**
 *  Representa un error generico del sistema
 */
class ServerException extends BaseException {
    constructor() {
        super(500, "SERVER_ERROR", "There is a problem with the server.");
    }
}
exports.ServerException = ServerException;
/**
 *  Representa que el cliente envio mal unos parametros . Agrega un diccionario de los campos invalidos.
 */
class ArgumentsException extends BaseException {
    constructor(args) {
        super(400, "ARGUMENTS_ERROR", "The arguments suplied are wrong");
        this.arguments = args;
    }
}
exports.ArgumentsException = ArgumentsException;
/**
 * Representa un tipo de error de negocio generico
 */
class BadRequestException extends BaseException {
    constructor(errorCode, details) {
        super(400, "BAD_REQUEST", "Bad request");
        this.errorCode = errorCode;
        this.details = details;
    }
}
exports.BadRequestException = BadRequestException;
/**
 *  Representa que el cliente envió demasiadas solicitudes en una ventana de tiempo, y le denegamos temporalmente el servicio.
 */
class ApiQuotaException extends BaseException {
    constructor(time) {
        super(403, "API_QUOTA_EXCEEDED", "You exceeded the maximum requests allowed in this period.");
        this.time = time ? time : 1000;
        this.details = `You exceeded the maximum requests allowed. Please wait for ${this.time / 1000} seconds and try again.`;
    }
}
exports.ApiQuotaException = ApiQuotaException;
class NotFoundException extends BaseException {
    constructor() {
        super(404, "NOT_FOUND", "The resource that you are looking for doesn't exists");
    }
}
exports.NotFoundException = NotFoundException;
/**
 *  Representa que no se encontro una determinada entidad en Base de Datos.
 *  Suele largarse a nivel DAO , por ejemplo, si se busca una entidad inexistente.
 *  La hacemos una clase diferente para poder catcharla en algun  servicio si hace falta,
 *  ya que NotFoundException correspondería más a la capa de transporte.
 */
class ModelNotFoundException extends NotFoundException {
}
exports.ModelNotFoundException = ModelNotFoundException;
class DuplicatedKeyException extends BadRequestException {
    constructor() {
        super("ENTITY_ALREADY_EXISTS", "The resource you're trying to create already exists");
    }
}
exports.DuplicatedKeyException = DuplicatedKeyException;
/**
 *  Representa un error de base de datos.
 *  Puede ser un  error de lectura o escritura de datos, siempre se produce en los DAOs
 */
class DatabaseException extends Error {
    /**
     * @param {Error} error  el error que produjo la excepcion
     */
    constructor(error) {
        super(error.message);
        super.stack = error.stack;
    }
}
exports.DatabaseException = DatabaseException;
