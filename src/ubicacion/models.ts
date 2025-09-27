import mongoose from "mongoose"
import {
    Schema,
    Document,
    ObjectId
} from "mongoose"

export interface Locality {
    nameLocality : string;
    id: string;
}

export interface Province {
    nameProvince : string;
    id: string;
}


export interface LocalityDoc extends Document {
    nameLocality : string;
    id?:ObjectId;
}

export interface ProvinceDoc extends Document {
    nameProvince : string;
    id?:ObjectId;
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
    id : {
        type: Schema.Types.ObjectId,
    },
})

export const LocalitySchema = new Schema({
    nameLocality : {
        type: String, 
        unique: true,
        required: true,
    },
    id : {
        type: Schema.Types.ObjectId,
    },
})

export const ProvinceModel = mongoose.model<any>("Province", ProvinceSchema)
export const LocalityModel = mongoose.model<any>("Locality", LocalitySchema)