// import fileUpload from "express-fileupload"
// import * as db from "../database/db.js"
// import * as express from "express"
// const routes = require("./routes.js")
// const middleware = require("./middleware")
// const handler  = require("../common/exception/handler.js")
// import multer from 'multer'
// import path from "path";
// import cors from "cors";
// import * as dotenv from "dotenv";
// import imageRouter from "../imagen/routes.js"; // <--- Import the default exported router
// import { route } from "./routes.js"


// dotenv.config();

// console.log('--- VERIFICACIÓN DE VARIABLES DE ENTORNO DE CLOUDINARY ---');
// console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUD_NAME);
// console.log('CLOUDINARY_API_KEY:', process.env.API_KEY ? '***** (cargada)' : 'NO DEFINIDA'); // Oculta el valor real
// console.log('CLOUDINARY_API_SECRET:', process.env.API_SECRET ? '***** (cargada)' : 'NO DEFINIDA'); // Oculta el valor real
// console.log('----------------------------------------------------');



    
// /**
//      *  Clase maestra  de nuestra aplicación. Va  a tener toda la lógica  de inicialización de servidor,
//      *  conectarse a la BBDD, setear los middleware , etc.  
//      * 
//      *  @param {Express} app
//      *  
//      */

// export class SoundRoomsServer {
    

//     _app : express.Application;

//     constructor (app: express.Application){
//         this._app = app
//     }
//     /**
//      *  Inicia nuestra app , se conecta con Mongo y Redis y carga las rutas.
//      *  @param {Int} port
//      */
//     start(port: number) {
//         this._startEngines()
//        .then(() => {
//            this._app.set('trust proxy', true)
//             middleware.middleware(this._app)
//             // this._app.use(fileUpload({
//             //     useTempFiles: true,
//             //     tempFileDir: '/tmp/',
//             //     createParentPath: true,
//             //     limits: {
//             //         fileSize:10000000 //10mb
//             //     }
//             // }))

//             const allowedOrigins = [
//                 'http://localhost:5173' // Si es en desarrollo
                
//                 // Agrega tu dominio de producción aquí
//                 //'https://tu-frontend-en-produccion.com' 
//             ];

//             this._app.use(cors({
//                 origin: allowedOrigins,  // Permitir solo estos orígenes
//                 methods: ['GET', 'POST', 'PUT', 'DELETE'],
//                 allowedHeaders: ['Content-Type', 'Authorization']
//             }));
            
//             this._app.use('/uploads', express.static(path.resolve('uploads')))
//             console.log('Serving static files from:', path.join('C:/Users/matti/Desktop/soundroom_final/pdf_soundroom'));
//             this._app.use('/pdfs', express.static(path.join('C:/Users/matti/Desktop/soundroom_final/pdf_soundroom/pdfs')));

//             this._app.use('/image', imageRouter); 
//             this._app.use(express.json());
//             this._app.use(express.urlencoded({extended: true}))
//             routes.route(this._app)
//             handler.handle(this._app)

//             // esta carpeta sera usada para almacenar  archivos publicos
//             this._app.use('/uploads', express.static(path.resolve('uploads')));
//             // this._app.listen(port)
//             // console.log("App started successfully")
//             this._app.listen(port, () => {
//                 console.log(`App started successfully on port ${port}`);
//             });
//         })
//         .catch((error) => {
//             console.error("Error initialazing the app")
//             console.error(error)
//             process.exit(1)
//         })
//     }


//     /**
//      *  Todo lo que necesitemos inicializar para que el sistema funcione (por ejemplo , connectarnos a la base de datos o redis)
//      *  va acá.
//      */
//     async _startEngines() : Promise<void> {
//        return await db.connect()
//     }

// }


// server.ts

// ... (todas tus importaciones) ...
import * as express from "express" // Asegúrate que esta importación sea correcta si usas 'export default app'
const middleware = require("./middleware")
import cors from "cors";
import path from "path";
import imageRouter from "../imagen/routes.js";
import {routes} from "./routes.js";
//const routes = require("./routes.js")
const handler  = require("../common/exception/handler.js")
import * as db from "../database/db.js"


// ... (Toda la lógica de logs de Cloudinary, etc.) ...

export class SoundRoomsServer {
    
    _app : express.Application;

    constructor (app: express.Application){
        this._app = app
    }

    async getApp(): Promise<express.Application> {
        try {
            await this._startEngines();
            this._app.set('trust proxy', true);

            // **CORS LO PRIMERO - VERSIÓN AGRESIVA**
           this._app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', '*');
            res.header('Access-Control-Allow-Headers', '*');
            
            if (req.method === 'OPTIONS') {
                return res.status(200).end();
            }
            next();
        });

            // ... el resto de tu middleware
            middleware.middleware(this._app);
            this._app.use(express.json());
            this._app.use(express.urlencoded({extended: true}));
            
            routes(this._app);
            handler.handle(this._app);

            return this._app;

        } catch (error) {
            console.error("Error initializing the app:", error);
            throw error;
        }
    }

    // ... (Tu método _startEngines es correcto) ...
    async _startEngines() : Promise<void> {
        return await db.connect()
    }
}