import { Application, Request, Response, request, response } from "express";
//import * as validator from "express-validator";
import { run } from "../common/utils/run";
//import { upload } from "../common/utils/upload";
// import { cloudinaryImageUploadMethod } from "src/common/utils/uploader";
// import { ImagenDoc } from "./model";
import  * as service from "./service"
import { UserModel } from "../users/models";
//import { upload, uploadToCloudinary } from "src/common/cloudinary/cloudinary";
import upload from "../common/utils/storage"
import multer from "../common/utils/storage";
import { ImagenDto } from "./dto";
import { Imagen } from "./model";

export const route = (app: Application) => {

    // endpoint to save image on cloudinary, didnt work
    // app.post("/imagenes/", upload.array('img'), run (async (req, res ) => {

    //     const urls = [];
    //     let files: any;
    //     files = req.files

    //     //Si son muchas imagenes
    //     if(files.isArray()){
    //         for (const file of files) {
    //             const { path } = file

    //             // const newPath = await cloudinaryImageUploadMethod(path)
    //             // urls.push(newPath)
    //             const file_image = cloudinary.v2.uploader.upload(file, {
    //                 public_id: `${Date.now()}`,
    //                 resource_type: "auto",  
    //             })


    //            const imagen = await service.instance.createImagen({
    //             id : file_image.public_id,
    //             url : file_image.secure_url
    //            })
    //         }
    //     }
    // }))


    // app.post("/imagen/", upload.single("img"), run (async (req : Request | any, res: Response ) => {
    
    //     const file = req.files
    //     const image = file.img

    //     console.log(file)
    //     console.log('image: ', image)
    //     console.log('tempFilePath: ', image.tempFilePath)

    //     try {
    //         const file_image = cloudinary.uploader.upload(image.tempFilePath
    //             //     , {
    //             //     public_id: `${Date.now()}`,
    //             //     resource_type: "auto",  
    //             // }
    //         )
    //         console.log(file_image)
    //     } catch (error) {
    //         console.error(error)
    //     }

    //     // const imagen = await service.instance.createImagen({
    //     //     id : file_image.public_id,
    //     //     url : file_image.secure_url
    //     //    })

    // }))


    // app.post("/create_images/", upload.single('img'), run (async (req: Request | any, res: Response ) =>{
    //     // en form.data se envia el file con el nombre de valor img, entonces en file
    //     // bajo la var img esta la imagen
    //     //console.log(req.files.img)
    //     const file = req.files;
    //     console.log("req.files: ", file)
    //     const {tempPath} = req.files.img
    //     console.log('tempPath: ', tempPath)

    //     //validaciones
    //     //si hay un arreglo vacio de imagen o img dentro de file
    //     if(!req.files || Object.keys(req.files).length===0 || !req.files.img) {
    //         return res.status(400).json({
    //             msg: "La imagen no se envio correctamente"
    //         })
    //     }

    //     //validacion  para cambiar imagen de perfil en el modulo que corresponda mover
    //     //const usuario =  await UserModel.findById({id});

    //     // if(!usuario){
    //     //     return res.status(400).json({msg: "no hya usuario con ese id"})
    //     // }

    //     // if (usuario.imageId){
    //     //     //borrar imagen anterior en cloudninary

    //     // }
    //     // agregar imagen a cloudinary


    //     try {
    //         const imagen = file.img;
    //         const path = imagen.tempFilePath
    //         console.log('try - subir imagen, imagen: ',imagen);
    //         const imagenCloudinary = await cloudinary.uploader.upload(path
    //             //, {
    //         //     public_id: `${Date.now()}`,
    //         //     resource_type: "auto",  
    //         // }
    //         )
    //         console.log(imagenCloudinary)
    //         return res.status(200).json({msg: "image created"})
    //     } catch (error) {
    //         console.error(error)
    //         return res.status(400).json({err: "Error 400, algo paso"})
    //     }


    // }))


    //opcion para guardar con multer, no funciono
    // app.post("/image/create", upload.single("img"), async (req: Request |any, res: Response ) => {
    //     const port= process.env.PORT
    //     const host = process.env.HOST
    //     const url = ''
    //     console.log(req.files)
    //     if(req.files){
    //         const {filename} = req.files
    //         console.log(filename)
    //         //const imgUrl = `http://localhost:${process.env.PORT}/images/${
    //         const url = `${host}:${port}/public/${filename}`
    //         const imagen = service.instance.createImagen(url);
    //         console.log(imagen)
    //     }
    // })

    app.get("/image", run(async (req: Request, res: Response) =>{
        const imagenes: ImagenDto[] = await service.instance.getAllImagens()
        return res.json(imagenes)
    }))

    app.get("/image/findOne/",
        run(async (req:Request, resp: Response) => {
            const id = req.query.id as string
            console.log('req.query: ' + id)
            const imagen : ImagenDto = await service.instance.findImagenById(id);
            resp.json(imagen)
    }))

    app.post("/image/create/", multer.single('img'), run(async (req: Request, res: Response)=>{
        console.log(req.body)

        const {titulo, descripcion} = req.body
        const file = req.file
        console.log("file: ", file)
        console.log("req.file: ", req.file)
        console.log("body: ", titulo, descripcion)
        const imageUrl = req.file?.path as string
        const filename = req.file?.filename as string
        const imageUrl2 = `${process.env.APP_HOST}:${process.env.APP_PORT}/public/${filename}`
        console.log(req.file?.path)
        console.log("imageUrl: ", imageUrl)
        console.log("imageUrl 2: ", imageUrl2)
        const newImagen = {
            titulo: titulo,
            descripcion: descripcion,
            url: imageUrl
        };
        //const imagen = await service.instance.createImagen(newImagen) 
        return res.json({
            msg: 'photo succesfully saved',
            //imagen
        })
    }))

    app.delete("/image/delete", run(async(req: Request, res:Response)=>{
        const id = req.query.id as string
        
        const image =  await service.instance.findImagenById(id)
        if(!image){
            return res.json({
                msg: "La imagen que se quiere borrar no existe, intente nuevamente con otra"
            })
        }
        const deletedImage = await service.instance.deleteImage(id, image)
        if(deletedImage){
            return res.json({
                msg: "image deleted succesfully"
            })
        }
   
        
    }))

    app.put("/image/update/", run(async(req: Request, res:Response)=>{
        const id = req.query.id as string
         const {titulo, descripcion}= req.body
         console.log("body: ", titulo, descripcion)
         //busco si existe imagen
        const image: ImagenDto =  await service.instance.findImagenById(id)
        if(!image){
            return res.json({
                msg: "La imagen que se quiere actualizar no existe"
            })
        }
        //creo objeto a actualizar
        const imageToUpdate = {
            titulo: titulo,
            descripcion: descripcion
        }
        //actualizo el objeto requerido
        const updatedImage = await service.instance.updateImage(id, imageToUpdate)
       // retorno respuesta satisfactoria
        if(updatedImage){
            return res.json({
                msg: "image update succesfully",
                updatedImage
            })
        }
        
   
        
    }))

    app.delete("/image/removeImage/", run(async(req: Request, res:Response)=>{
        const id = req.query.id as string
        
        const image =  await service.instance.findImagenById(id)
        if(!image){
            return res.json({
                msg: "La imagen que se quiere borrar no existe, intente nuevamente con otra"
            })
        }
        const deletedImage = await service.instance.removeImage(id)
        if(deletedImage === true){
            return res.json({
                msg: "image deleted succesfully"
            })
        }else{
            return res.json({
                msg: "image not deleted"
            })
        }
   
        
    }))

    
}