"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect = void 0;
require('dotenv').config();
const mongoose_1 = __importDefault(require("mongoose"));
// Connects to the local database. In the future it could be anything
const connect = async () => {
    try {
        //await mongoose.connect(`mongodb://localhost/${process.env.MONGO_DB_NAME}`)
        // await mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.MONGO_DB_NAME}`, 
        //version atlas: 
        //await mongoose.connect(`mongodb+srv://ale_mat:eamale123@cluster0.l3izy.mongodb.net/${process.env.MONGO_DB_NAME}`, 
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('No Mongo URI defined in environment variables');
        }
        await mongoose_1.default.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        });
        mongoose_1.default.set('returnOriginal', false);
    }
    catch (e) {
        console.error("Error connecting to mongoose");
        console.error(e);
        throw e;
    }
};
exports.connect = connect;
// , {useNewUrlParser: true, useUnifiedTopology: true}
