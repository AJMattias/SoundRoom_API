import * as dotenv from "dotenv"
dotenv.config()
import express from "express"
import {SoundRoomsServer} from "./server/server.js"

const app = express()
// Si APP_PORT esta definido, parseamos el port number, si no usamos 3000 por defecto
const port : number = process.env.APP_PORT ? parseInt(process.env.APP_PORT) : 30000

//Logica de error handling y salida forzada del sistema.
process.on('uncaughtException', (error) =>{
    console.error("Uncaught fatal exception!!")
    console.error(error)
}) 


const server = new SoundRoomsServer(app)
server.start(port)
