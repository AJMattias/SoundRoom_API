import multer from 'multer';
import {uuid} from "uuidv4";
import path from "path"

const storage = multer.diskStorage({
    destination: 'uploads',
    filename:(req, file, cb) =>{
        //cb( no retorno error, pero si un id)  
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
})

export default multer({storage});