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
// import * as express from "express" // Asegúrate que esta importación sea correcta si usas 'export default app'
// const middleware = require("./middleware")
// import cors from "cors";
// import path from "path";
// import imageRouter from "../imagen/routes.js";
// import {routes} from "./routes.js";
// //const routes = require("./routes.js")
// const handler  = require("../common/exception/handler.js")
// import * as db from "../database/db.js"


// // ... (Toda la lógica de logs de Cloudinary, etc.) ...

// export class SoundRoomsServer {
    
//     _app : express.Application;

//     constructor (app: express.Application){
//         this._app = app
//     }

//     async getApp(): Promise<express.Application> {
//         try {
//             await this._startEngines();
//             this._app.set('trust proxy', true);

//             // **CORS CON LOGS**
//             this._app.use(cors({
//                origin: [
//                     'https://sound-room-front-web.vercel.app',
//                     'http://localhost:5173',
//                     'http://localhost:3000'
//                 ],
//                 methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
//                 allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
//                 credentials: true,
//                 optionsSuccessStatus: 200,
//                 preflightContinue: false
//             }));

//             // ... el resto de tu middleware
//             middleware.middleware(this._app);
//             this._app.use(express.json());
//             this._app.use(express.urlencoded({extended: true}));
            
//             routes(this._app);
//             handler.handle(this._app);

//              // **VERIFICÁ QUE ESTO SE EJECUTE**
//             console.log('🔄 Cargando rutas...');
//             routes(this._app);
//             console.log('✅ Rutas cargadas');

//             return this._app;

//         } catch (error) {
//             console.error("Error initializing the app:", error);
//             throw error;
//         }
//     }

//     // ... (Tu método _startEngines es correcto) ...
//     async _startEngines() : Promise<void> {
//         await db.connect()
//     }
// }


//------------------------------
//version nueva para que se conecte con vercel ip whitelist problem
//
//

// server/server.ts
import express from 'express';
import cors from 'cors';
import { connect, getConnectionStatus } from '../database/db';
import {routes} from "./routes.js";
// ... otros imports

export class SoundRoomsServer {
  _app: express.Application;
  isDbConnected: boolean = false;

  constructor(app: express.Application) {
    this._app = app;
  }

  async getApp(): Promise<express.Application> {
    try {
      // 1. Configurar CORS ANTES que cualquier otra cosa
      this._app.use(cors({
        origin: '*',
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        optionsSuccessStatus: 200
      }));

      // 🔥 Manejar OPTIONS explícitamente
      this._app.options('*', cors());

      // 2. Middleware de conexión LAZY (se ejecuta en cada request)
      this._app.use(async (req, res, next) => {
        try {
          // Solo conectar si no hay conexión activa
          if (!this.isDbConnected) {
            console.log('🔄 Intentando conectar a DB...');
            await connect();
            this.isDbConnected = true;
            const status = getConnectionStatus();
            console.log(`✅ DB Status: ${JSON.stringify(status)}`);
          }
          next();
        } catch (error: any) {
          console.error('❌ DB Connection middleware error:', error);
          // 🔥 En lugar de fallar, enviar error 503 (Service Unavailable)
          res.status(503).json({ 
            error: 'Database connection failed',
            details: error.message 
          });
        }
      });

      // 3. Middleware de logs
      this._app.use((req, res, next) => {
        console.log(`📝 ${req.method} ${req.path}`);
        next();
      });

      // 4. Body parsers
      this._app.use(express.json());
      this._app.use(express.urlencoded({ extended: true }));

      // 5. Rutas
      console.log('🔄 Cargando rutas...');
      routes(this._app);
      console.log('✅ Rutas cargadas');

      // 6. Manejador de errores global
      this._app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.error('❌ Error global:', err);
        res.status(500).json({ 
          error: 'Internal server error',
          message: err.message 
        });
      });

      return this._app;

    } catch (error) {
      console.error("❌ Error initializing the app:", error);
      throw error;
    }
  }
}