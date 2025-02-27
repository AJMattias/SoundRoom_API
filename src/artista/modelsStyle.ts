import mongoose from "mongoose"
import {
    Schema,
    Document,
    ObjectId
} from "mongoose"
import {ArtistType} from "./modelsType"

var ArtistType = mongoose.model('ArtistType');

export interface ArtistStyle {
    nameArtistStyle : string;
    id: string;
    idArtistType: string;
}
export interface ArtistStyleDoc extends Document {
    nameArtistStyle : string;
    id?: ObjectId;
    idArtistType?: ObjectId;
}

export const ArtistStyleSchema = new Schema({
    nameArtistStyle : {
        type: String, 
        unique: true,
        required: true,
    },
    idArtistType : {
        type: Schema.Types.ObjectId,
        ref: "ArtistType",
    },
    id : {
        type: Schema.Types.ObjectId,
    },
})

export const ArtistStyleModel = mongoose.model<ArtistStyleDoc>("ArtistStyle", ArtistStyleSchema)