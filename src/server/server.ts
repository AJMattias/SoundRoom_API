import fileUpload from "express-fileupload"
import * as db from "../database/db.js"
import * as express from "express"
const routes = require("./routes.js")
const middleware = require("./middleware")
const handler  = require("../common/exception/handler.js")
import multer from 'multer'
import path from "path";


    
/**
     *  Clase maestra  de nuestra aplicación. Va  a tener toda la lógica  de inicialización de servidor,
     *  conectarse a la BBDD, setear los middleware , etc.  
     * 
     *  @param {Express} app
     *  
     */

export class SoundRoomsServer {

    _app : express.Application;

    constructor (app: express.Application){
        this._app = app
    }
    /**
     *  Inicia nuestra app , se conecta con Mongo y Redis y carga las rutas.
     *  @param {Int} port
     */
    start(port: number) {
        this._startEngines()
       .then(() => {
           this._app.set('trust proxy', true)
            middleware.middleware(this._app)
            // this._app.use(fileUpload({
            //     useTempFiles: true,
            //     tempFileDir: '/tmp/',
            //     createParentPath: true,
            //     limits: {
            //         fileSize:10000000 //10mb
            //     }
            // }))
            this._app.use(express.json());
            this._app.use(express.urlencoded({extended: false}))
            this._app.use('/uploads', express.static(path.resolve('uploads')))
            console.log('Serving static files from:', path.join('C:/Users/manzu/Desktop/soundroom_final/pdf_soundroom'));
            this._app.use('/pdfs', express.static(path.join('C:/Users/manzu/Desktop/soundroom_final/pdf_soundroom/pdfs')));

            routes.route(this._app)
            handler.handle(this._app)

            // esta carpeta sera usada para almacenar  archivos publicos
            this._app.use('/uploads', express.static(path.resolve('uploads')));
            this._app.listen(port)
            console.log("App started successfully")
        })
        .catch((error) => {
            console.error("Error initialazing the app")
            console.error(error)
            process.exit(1)
        })
    }


    /**
     *  Todo lo que necesitemos inicializar para que el sistema funcione (por ejemplo , connectarnos a la base de datos o redis)
     *  va acá.
     */
    async _startEngines() : Promise<void> {
       return await db.connect()
    }

}