import {
    Application,
    Request,
    Response
} from "express"

import {
    BaseException ,
    ServerException,
    DuplicatedKeyException, 
    ModelNotFoundException,
} from "./exception"

import {Error as MongoError} from "mongoose"


/***
 *  Manejo de excepciones  de nuestra app.
 *  Este middleware va a interceptar las excepciones de negocio que larguemos en cada request
 *   
 * @param {Express} app
 */
const handle = (app: Application) => {
    app.use(function (err: Error, req: Request,res: Response ,next: any){
            console.log("Got error! ")
            if(err instanceof BaseException){
                err.send(res)
            }else{
                const mapped = mapMongoError(err)
                if(mapped && mapped instanceof BaseException){
                    mapped.send(res)
                    return
                }
                console.error("Uncaught error!")
                console.error(err)
                const serverError = new ServerException()
                serverError.send(res)
            } 
    })
}

exports.handle = handle



const mapMongoError = (mongoError: MongoError)  => {
    console.error("MongoError got!!")
    console.error(mongoError)
    if(mongoError.message.indexOf("duplicate key error") !== -1){
        return new DuplicatedKeyException()
    }else if(mongoError instanceof ModelNotFoundException){
        return mongoError
    }else if(mongoError.message.indexOf("Cast to ObjectId failed") !== -1){
        return new ModelNotFoundException()
    }else{
        return undefined
    }
}
