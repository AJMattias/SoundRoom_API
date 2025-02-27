import {Request, Response} from "express"
/**
 *  Ejecuta una funcion teniendo cuidado de atrapar las excepciones a nivel rutas.
 *  Debemos usar esto en todos nuestros endpoints.
 */
interface ICallback {
    (req: Request, resp: Response): void
}

export const run = (callback : ICallback) => {
    return async (req : Request, res : Response, next: any) => {
        try{
           await callback(req, res)
        }catch(err){
            next(err)
        }
    }
}