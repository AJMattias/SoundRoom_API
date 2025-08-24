import {ValidationError} from "express-validator"
import {ArgumentsException } from "../exception/exception"

export const ValidatorUtils = {
    /**
     * Convierte un array de la libreria de express-validation en un ArgumentsException
     * @param validationErrors {Array<ValidationError>} array de  ValidationError obetnido con errors.error()
     * @returns {ArgumentsException} la excepcion que debemos lanzar de nuestro lado.
     */
    toArgumentsException(validationErrors : Array<ValidationError>) : ArgumentsException{
          return new ArgumentsException(
              validationErrors.map(
                  (error : ValidationError)  => {
                       return {
                           field : error.param,
                           code: error.msg
                       } 
                  }
              )
          )  
    }
}