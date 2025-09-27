require('dotenv').config()
import mongoose from "mongoose"
// Connects to the local database. In the future it could be anything
export const connect  = async () =>{
    try{
         //await mongoose.connect(`mongodb://localhost/${process.env.MONGO_DB_NAME}`)
        // await mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.MONGO_DB_NAME}`, 
        
        //version atlas: 
       //await mongoose.connect(`mongodb+srv://ale_mat:eamale123@cluster0.l3izy.mongodb.net/${process.env.MONGO_DB_NAME}`, 
       
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('No Mongo URI defined in environment variables');
        }
        await mongoose.connect(mongoUri,
        {
           })
        mongoose.set('returnOriginal', false)
    } catch (e){
        console.error("Error connecting to mongoose")
        console.error(e)
        throw e
    }
}

// , {useNewUrlParser: true, useUnifiedTopology: true}