import * as dao from './dao'
import { CreateImagenDto, ImagenDto } from './dto';
import { Imagen } from './model';
import path from "path";
import fs from "fs-extra"

export class ImagenService{

    dao: dao.ImagenDao;
    constructor(imagenDao: dao.ImagenDao){
        this.dao = imagenDao;
    }

    mapToDto(imagen: Imagen): ImagenDto{
        return{
            id: imagen.id,
            url: imagen.url,
            titulo: imagen.titulo,
            descripcion: imagen.descripcion,
            visible: imagen.visible,
            createdAt: imagen.createdAt
        }
    }
    //serviceio de store imagen
    async createImagen(dto: CreateImagenDto): Promise<ImagenDto>{
        return this.mapToDto(
            await this.dao.createImagen({
                titulo: dto.titulo,
                descripcion: dto.descripcion,
                url: dto.url,
                createdAt: new Date(),
                visible: true
            })
        )
        
    }

    async getAllImagens(): Promise<Array<ImagenDto>>{
        const imagens =  await this.dao.getAll();
        return imagens.map((imagen: Imagen)=>{
            return this.mapToDto(imagen)
        })
    }

    async findImagenById(id: string): Promise<ImagenDto>{
        const imagen = await this.dao.findById(id)
        return this.mapToDto(imagen)
    }

    async updateImage(id: string, dto: CreateImagenDto):Promise<ImagenDto>{
        const image = await this.findImagenById(id)
        console.log(dto)
        if(!dto.titulo){
            dto.titulo = image.titulo;
        }
        if(!dto.descripcion){
            dto.descripcion = image.descripcion;
        }
        if(!dto.url){
            dto.url = image.url;
        }
        if(!dto.createdAt){
            dto.createdAt = image.createdAt;
        }
        return this.mapToDto(
            await this.dao.updateImagen(id,{
                titulo: dto.titulo,
                descripcion: dto.descripcion,
                createdAt: dto.createdAt,
                url: dto.url,
                visible: true
            })
        )
    }
    async deleteImage(id: string, dto: CreateImagenDto):Promise<ImagenDto>{
        return this.mapToDto(
            await this.dao.deleteImagen(id,{
                titulo: dto.titulo,
                descripcion: dto.descripcion,
                url: dto.url,
                //createdAt queda en null al borrar, ver esto
                createdAt: dto.createdAt,
                deletedAt: new Date(),
                visible: false
            })
        )
    }

    //TODO: hacer el delete de la base de datos no logica, con findByIdAndRemove
    async removeImage(id:string):Promise<boolean>{
        const imagenToRemove = await this.dao.findById(id)
        const imagen = await dao.instance.removeImage(id)
        if(imagen){
            await fs.unlink(path.resolve(imagenToRemove.url))
            return true
        }else{
            return false
        }
    }

}

export const instance = new ImagenService(dao.instance)