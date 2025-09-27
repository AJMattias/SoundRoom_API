// import * as dotenv from "dotenv"
// dotenv.config()
// import express from "express"
// import {SoundRoomsServer} from "./server/server.js"

// const app = express()
// // Si APP_PORT esta definido, parseamos el port number, si no usamos 3000 por defecto
// const port : number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000

// //Logica de error handling y salida forzada del sistema.
// process.on('uncaughtException', (error) =>{
//     console.error("Uncaught fatal exception!!")
//     console.error(error)
// }) 


// const server = new SoundRoomsServer(app)
// server.start(3000)

// app.ts

//vercel version gemini
// import * as dotenv from "dotenv"
// dotenv.config()
// import express from "express"
// import { SoundRoomsServer } from "./server/server" // Asegúrate que la ruta sea correcta

// const app = express()

// // Lógica de error handling (déjala)
// process.on('uncaughtException', (error) => {
//     console.error("Uncaught fatal exception!!")
//     console.error(error)
// }) 

// const server = new SoundRoomsServer(app)

// // Usamos el nuevo método getApp y luego exportamos el resultado.
// // Esto se ejecutará la primera vez que Vercel inicialice la función serverless.
// export default server.getApp()

// /* * Lógica para ejecutar LOCALMENTE (Opcional pero muy útil):
//  * Si quieres mantener tu lógica local con `npm run start`, puedes hacer esto:
//  */
// if (process.env.NODE_ENV !== 'production') {
//     const port: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000
//     server.getApp()
//         .then(app => {
//             app.listen(port, () => {
//                 console.log(`[Local DEV] App started successfully on port ${port}`);
//             })
//         })
//         .catch(error => {
//             console.error('Error starting local server:', error);
//             process.exit(1);
//         });
// }

//vercel version deepseek
import * as dotenv from "dotenv"
dotenv.config()
import express from "express"
import { SoundRoomsServer } from "./server/server.js"

const app = express()
const server = new SoundRoomsServer(app)

// **OPCIÓN 2**
export default server.getApp().then(app => app);

// **SOLO PARA DESARROLLO LOCAL**
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    server.getApp()
        .then(app => {
            app.listen(port, '0.0.0.0', () => {
                console.log(`[Local DEV] Server running on port ${port}`);
            });
        })
        .catch(error => {
            console.error('Failed to start server:', error);
            process.exit(1);
        });
}