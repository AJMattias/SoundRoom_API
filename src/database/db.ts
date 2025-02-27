require('dotenv').config()
import mongoose from "mongoose"
// Connects to the local database. In the future it could be anything
export const connect  = async () =>{
    try{
         //await mongoose.connect(`mongodb://localhost/${process.env.MONGO_DB_NAME}`)
         await mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.MONGO_DB_NAME}`, 
         {useNewUrlParser: true, useUnifiedTopology: true,
         //useFindAndModify:false
        })
         mongoose.set('returnOriginal', false)
    } catch (e){
        console.error("Error connecting to mongoose")
        console.error(e)
        throw e
    }
}

// , {useNewUrlParser: true, useUnifiedTopology: true}