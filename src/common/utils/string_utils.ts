import {ObjectId, Schema } from "mongoose"
import {ModelNotFoundException} from "../exception/exception"

/**
 * Clase Helper que nos permite manejar cosas relacionadas a Strings
 * cualquier utilidad de Stringsd debe ir aca.
 */
export const StringUtils = {
    toObjectId(str: string) : Schema.Types.ObjectId{
        try{
            return  new Schema.Types.ObjectId(str)
        }catch(ex: any){
            console.error("Got wrong objectId : "+str)
            throw new ModelNotFoundException()
        }
    },

    isString(obj? : any) : boolean {
        return obj != undefined && typeof(obj) == "string"
    },

    isNotEmpty(str?: string) : boolean {
        return str != null && str.length > 0
    },

    isEmail(str?: any){
        const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return this.isString(str)
            &&  regex.test(str)
    }
}