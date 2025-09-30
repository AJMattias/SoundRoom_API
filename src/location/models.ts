import mongoose from "mongoose"
import {
    Schema,
    Document,
    ObjectId
} from "mongoose"



export interface Province {
    nameProvince : string;
}



export interface ProvinceDoc extends Document {
    nameProvince : string;
}


/**
 *  Definicion de la "tabla" en Mongoose de  User.  No queremos hacer nada raro con ella, simplemente define los tipos de los campos.
 *  No nos interesa a�adir l�gica de negocio (por ejemplo validar campos) ac�, porque eso ser�a acoplar las responsabilidades de una clase  
 *  que s�lo debe encargarse de persistencia. Tampoco hay que meter b�squedas de BBDD ni nada parecido en los schemas. 
 * 
 */
export const ProvinceSchema = new Schema({
    nameProvince : {
        type: String, 
        unique: true,
        required: true,
    },
})



export const ProvinceModel = mongoose.model<any>("Province", ProvinceSchema)

