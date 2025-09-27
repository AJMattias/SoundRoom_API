import mongoose from "mongoose"
import {
    Schema,
    Document,
    ObjectId
} from "mongoose"



export interface ArtistType {
    nameArtistType : string;
    id: string;
}



export interface ArtistTypeDoc extends Document {
    nameArtistType : string;
    id?: ObjectId;
}


/**
 *  Definicion de la "tabla" en Mongoose de  User.  No queremos hacer nada raro con ella, simplemente define los tipos de los campos.
 *  No nos interesa a�adir l�gica de negocio (por ejemplo validar campos) ac�, porque eso ser�a acoplar las responsabilidades de una clase  
 *  que s�lo debe encargarse de persistencia. Tampoco hay que meter b�squedas de BBDD ni nada parecido en los schemas. 
 * 
 */
export const ArtistTypeSchema = new Schema({
    nameArtistType : {
        type: String, 
        unique: true,
        required: true,
    },
    id : {
        type: Schema.Types.ObjectId,
    },
})



export const ArtistTypeModel = mongoose.model<any>("ArtistType", ArtistTypeSchema)