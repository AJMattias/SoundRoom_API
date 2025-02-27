import mongoose from "mongoose"
import {
    Schema,
    Document,
    ObjectId
} from "mongoose"

export interface TempCode {
    id: string;
    email: string;
    password: string;
    verificationCode: string;
    verificationCodeExpires: Date;
    user: string;
}

export interface TempCodeDoc extends Document {
    _id: string;
    email: string,
    password: string,
    verificationCode: string,
    verificationCodeExpires: Date,
    user: ObjectId
}

export const TempCodeSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    email: String,
    password: String,
    verificationCode: String,
    verificationCodeExpires: Date,
})

export const TempCodeModel = mongoose.model<TempCodeDoc>("TempCode", TempCodeSchema)