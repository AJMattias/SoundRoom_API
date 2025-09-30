import multer from 'multer';
import {uuid} from "uuidv4";
import path from "path"

const storage = multer.memoryStorage()

export default multer({storage});