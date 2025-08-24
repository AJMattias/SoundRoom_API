import { Router, Request, Response } from "express"; // Import Router
import multer from "multer";
import fs from 'fs';
//import { v2 as cloudinary } from 'cloudinary';
import { cloudinary } from '../common/utils/cloudinaryConfig'; // <-- Importa desde tu archivo de configuración


import { run } from "../common/utils/run";
import * as service from "./service";
import { ImagenData, ImagenDto } from "./dto";

interface MulterFile extends Express.Multer.File {}

// Create an Express Router instance
const router = Router(); // <--- Key change here!

// --- MULTER CONFIGURATION (still within this file or moved globally if needed) ---
const uploadDirectory = 'uploads'; // Relative path from where Node.js process starts
// Ensure the directory exists
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}
const upload = multer({ dest: uploadDirectory });

// --- Define your routes using 'router' instead of 'app' ---

router.get("/image", run(async (req: Request, res: Response) => {
    const imagenes: ImagenDto[] = await service.instance.getAllImagens();
    return res.json(imagenes);
}));

router.get("/image/findOne/", run(async (req: Request, resp: Response) => {
    const id = req.query.id as string;
    console.log('req.query: ' + id);
    const imagen: ImagenDto = await service.instance.findImagenById(id);
    resp.json(imagen);
}));

router.get("/image/delete", run(async (req: Request, res: Response) => {
    const id = req.query.id as string;
    const image = await service.instance.findImagenById(id);
    if (!image) {
        return res.json({ msg: "La imagen que se quiere borrar no existe, intente nuevamente con otra" });
    }
    const deletedImage = await service.instance.deleteImage(id, image);
    if (deletedImage) {
        return res.json({ msg: "image deleted succesfully" });
    }
}));

router.put("/image/update/", run(async (req: Request, res: Response) => { // <--- Now router.put is valid
    const id = req.query.id as string;
    const { titulo, descripcion } = req.body;
    console.log("body: ", titulo, descripcion);
    const image: ImagenDto = await service.instance.findImagenById(id);
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

router.get("/image/removeImage/", run(async (req: Request, res: Response) => {
    const id = req.query.id as string;
    const image = await service.instance.findImagenById(id);
    if (!image) {
        return res.json({ msg: "La imagen que se quiere borrar no existe, intente nuevamente con otra" });
    }
    const deletedImage = await service.instance.removeImage(id);
    if (deletedImage === true) {
        return res.json({ msg: "image deleted succesfully" });
    } else {
        return res.json({ msg: "image not deleted" });
    }
}));

// images/save route (the one with Multer)
router.post("/save", // <--- Now router.post is valid
    upload.array('images', 10),
    run(async (req: Request, res: Response) => {
        try {
            console.log('--- BACKEND: Contenido de req.files ---');
            console.log(req.files);
            console.log('--- BACKEND: Contenido de req.body ---');
            console.log(req.body);

            const files = (req.files as unknown) as MulterFile[];

            if (!files || files.length === 0) {
                console.error('BACKEND ERROR: No se recibieron archivos en req.files.');
                return res.status(400).json({ msg: "No se subieron imágenes." });
            }

            let imageMetadata: ImagenData[] = [];
            if (typeof req.body.imageMetadata === 'string' && req.body.imageMetadata) {
                try {
                    imageMetadata = JSON.parse(req.body.imageMetadata);
                    if (!Array.isArray(imageMetadata) || imageMetadata.length !== files.length) {
                        console.warn('Advertencia: La cantidad de metadatos no coincide con la cantidad de archivos. Se usará un valor por defecto.');
                    }
                } catch (parseError) {
                    console.error('Error al parsear metadatos de imagen:', parseError);
                    return res.status(400).json({ msg: "Formato de metadatos de imagen inválido." });
                }
            } else {
                console.warn('No image metadata provided or it is not a string.');
            }

            const savedImageInfos: { id: string
                //; url: string; description: string; enabled: boolean; 
            }[] = [];

            await Promise.all(files.map(async (file, index) => {
                let currentMetadata: ImagenData = imageMetadata[index] || { description: '', enabled: true };

                try {
                    const result = await cloudinary.uploader.upload(file.path, {
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

                } catch (error) {
                    console.error(`Error al subir imagen ${file.originalname} a Cloudinary o guardar en DB:`, error);
                    throw new Error(`Error al procesar imagen: ${file.originalname}`);
                } finally {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                }
            }));

            res.json({
                success: true,
                images: savedImageInfos
            });

        } catch (error) {
            console.error('Error general en la subida de imágenes:', error);

            if (req.files) {
                ((req.files as unknown) as MulterFile[]).forEach(file => {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
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
    })
);

export default router; // <--- Export the router instance