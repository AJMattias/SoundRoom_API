"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express"); // Import Router
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
//import { v2 as cloudinary } from 'cloudinary';
const cloudinaryConfig_1 = require("../common/utils/cloudinaryConfig"); // <-- Importa desde tu archivo de configuración
const run_1 = require("../common/utils/run");
const service = __importStar(require("./service"));
// Create an Express Router instance
const router = (0, express_1.Router)(); // <--- Key change here!
// --- MULTER CONFIGURATION (still within this file or moved globally if needed) ---
const uploadDirectory = 'uploads'; // Relative path from where Node.js process starts
// Ensure the directory exists
if (!fs_1.default.existsSync(uploadDirectory)) {
    fs_1.default.mkdirSync(uploadDirectory, { recursive: true });
}
const upload = (0, multer_1.default)({ dest: uploadDirectory });
// --- Define your routes using 'router' instead of 'app' ---
router.get("/image", (0, run_1.run)(async (req, res) => {
    const imagenes = await service.instance.getAllImagens();
    return res.json(imagenes);
}));
router.get("/image/findOne/", (0, run_1.run)(async (req, resp) => {
    const id = req.query.id;
    console.log('req.query: ' + id);
    const imagen = await service.instance.findImagenById(id);
    resp.json(imagen);
}));
router.get("/image/delete", (0, run_1.run)(async (req, res) => {
    const id = req.query.id;
    const image = await service.instance.findImagenById(id);
    if (!image) {
        return res.json({ msg: "La imagen que se quiere borrar no existe, intente nuevamente con otra" });
    }
    const deletedImage = await service.instance.deleteImage(id, image);
    if (deletedImage) {
        return res.json({ msg: "image deleted succesfully" });
    }
}));
router.put("/image/update/", (0, run_1.run)(async (req, res) => {
    const id = req.query.id;
    const { titulo, descripcion } = req.body;
    console.log("body: ", titulo, descripcion);
    const image = await service.instance.findImagenById(id);
    if (!image) {
        return res.json({ msg: "La imagen que se quiere actualizar no existe" });
    }
    const imageToUpdate = {
        titulo: titulo,
        descripcion: descripcion
    };
    const updatedImage = await service.instance.updateImage(id, imageToUpdate);
    if (updatedImage) {
        return res.json({ msg: "image update succesfully", updatedImage });
    }
}));
router.get("/image/removeImage/", (0, run_1.run)(async (req, res) => {
    const id = req.query.id;
    const image = await service.instance.findImagenById(id);
    if (!image) {
        return res.json({ msg: "La imagen que se quiere borrar no existe, intente nuevamente con otra" });
    }
    const deletedImage = await service.instance.removeImage(id);
    if (deletedImage === true) {
        return res.json({ msg: "image deleted succesfully" });
    }
    else {
        return res.json({ msg: "image not deleted" });
    }
}));
// images/save route (the one with Multer)
router.post("/save", // <--- Now router.post is valid
upload.array('images', 10), (0, run_1.run)(async (req, res) => {
    try {
        console.log('--- BACKEND: Contenido de req.files ---');
        console.log(req.files);
        console.log('--- BACKEND: Contenido de req.body ---');
        console.log(req.body);
        const files = req.files;
        if (!files || files.length === 0) {
            console.error('BACKEND ERROR: No se recibieron archivos en req.files.');
            return res.status(400).json({ msg: "No se subieron imágenes." });
        }
        let imageMetadata = [];
        if (typeof req.body.imageMetadata === 'string' && req.body.imageMetadata) {
            try {
                imageMetadata = JSON.parse(req.body.imageMetadata);
                if (!Array.isArray(imageMetadata) || imageMetadata.length !== files.length) {
                    console.warn('Advertencia: La cantidad de metadatos no coincide con la cantidad de archivos. Se usará un valor por defecto.');
                }
            }
            catch (parseError) {
                console.error('Error al parsear metadatos de imagen:', parseError);
                return res.status(400).json({ msg: "Formato de metadatos de imagen inválido." });
            }
        }
        else {
            console.warn('No image metadata provided or it is not a string.');
        }
        const savedImageInfos = [];
        await Promise.all(files.map(async (file, index) => {
            let currentMetadata = imageMetadata[index] || { description: '', enabled: true };
            try {
                const result = await cloudinaryConfig_1.cloudinary.uploader.upload(file.path, {
                    folder: 'salas-ensayo',
                    resource_type: 'auto'
                });
                const newImageDbEntry = await service.instance.createImagen({
                    titulo: currentMetadata.description || file.originalname,
                    descripcion: currentMetadata.description,
                    url: result.secure_url,
                    public_id: result.public_id
                });
                savedImageInfos.push({
                    id: newImageDbEntry.id ?? ''
                    // url: result.secure_url,
                    // description: currentMetadata.description,
                    // enabled: currentMetadata.enabled
                });
            }
            catch (error) {
                console.error(`Error al subir imagen ${file.originalname} a Cloudinary o guardar en DB:`, error);
                throw new Error(`Error al procesar imagen: ${file.originalname}`);
            }
            finally {
                if (fs_1.default.existsSync(file.path)) {
                    fs_1.default.unlinkSync(file.path);
                }
            }
        }));
        res.json({
            success: true,
            images: savedImageInfos
        });
    }
    catch (error) {
        console.error('Error general en la subida de imágenes:', error);
        if (req.files) {
            req.files.forEach(file => {
                if (fs_1.default.existsSync(file.path)) {
                    fs_1.default.unlinkSync(file.path);
                }
            });
        }
        let errorMessage = "Error al procesar imágenes.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        res.status(500).json({
            error: errorMessage,
            details: error
        });
    }
}));
exports.default = router; // <--- Export the router instance
