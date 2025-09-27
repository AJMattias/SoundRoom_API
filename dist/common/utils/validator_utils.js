"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidatorUtils = void 0;
const exception_1 = require("../exception/exception");
exports.ValidatorUtils = {
    /**
     * Convierte un array de la libreria de express-validation en un ArgumentsException
     * @param validationErrors {Array<ValidationError>} array de  ValidationError obetnido con errors.error()
     * @returns {ArgumentsException} la excepcion que debemos lanzar de nuestro lado.
     */
    toArgumentsException(validationErrors) {
        return new exception_1.ArgumentsException(validationErrors.map((error) => {
            return {
                field: error.param,
                code: error.msg
            };
        }));
    }
};
