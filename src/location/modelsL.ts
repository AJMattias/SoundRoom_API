import mongoose from "mongoose"
import {
    Schema,
    Document,
    ObjectId
} from "mongoose"
import {Province} from "./models"

var Province = mongoose.model('Province');

export interface Locality {
    nameLocality : string;
    idProvince: string;
}
export interface LocalityDoc extends Document {
    nameLocality : string;
    idProvince?: ObjectId;
}

export const LocalitySchema = new Schema({
    nameLocality : {
        type: String, 
        unique: true,
        required: true,
    },
    idProvince : {
        type: Schema.Types.ObjectId,
        ref: "Province",
    },
})

export const LocalityModel = mongoose.model<LocalityDoc>("Locality", LocalitySchema)