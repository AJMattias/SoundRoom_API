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
const routes = require("./routes.js")
const handler  = require("../common/exception/handler.js")
import * as db from "../database/db.js"


// ... (Toda la lógica de logs de Cloudinary, etc.) ...

export class SoundRoomsServer {
    
    _app : express.Application;

    constructor (app: express.Application){
        this._app = app
    }
    
    /**
     * Nuevo método para configurar la app sin iniciar el listener.
     * Retorna la instancia de Express.
     */
    async getApp(): Promise<express.Application> {
        try {
            await this._startEngines(); // Conexión a DB/Redis
            this._app.set('trust proxy', true);

            const allowedOrigins = [
                'http://localhost:5173', 
                // Agrega tu dominio de producción de Vercel aquí si es necesario
                // 'https://nombre-de-tu-app.vercel.app' 
            ];

            this._app.use(cors({
                //origin: allowedOrigins,
                origin: 'http://localhost:5173',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                allowedHeaders: ['Content-Type', 'Authorization']
            }));
            
            middleware.middleware(this._app);

            // ... (Toda tu lógica de CORS) ...
            
            // ATENCIÓN: Las rutas estáticas con path locales (C:/...) NO funcionarán en Vercel.
            // Debes usar rutas relativas al proyecto. Por ahora las dejo, pero ten cuidado.
            this._app.use('/uploads', express.static(path.resolve('uploads')));
            this._app.use('/pdfs', express.static(path.join('pdfs'))); // Ajustado para ser relativo
            // console.log('Serving static files from: ...'); // Remover logs de paths locales

            this._app.use('/image', imageRouter); 
            this._app.use(express.json());
            this._app.use(express.urlencoded({extended: true}));
            routes.route(this._app);
            handler.handle(this._app);
            
            return this._app; // <--- **Lo más importante: Retornar la app**

        } catch (error) {
            console.error("Error initialazing the app");
            console.error(error);
            // En Vercel, no llamas a process.exit(1), solo lanzas el error.
            throw error;
        }
    }

    // ... (Tu método _startEngines es correcto) ...
    async _startEngines() : Promise<void> {
        return await db.connect()
    }
}