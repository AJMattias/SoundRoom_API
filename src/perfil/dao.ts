import mongoose, { ObjectId } from "mongoose";
import { Perfil, PerfilDoc, PerfilModel } from "./models";
import { ModelNotFoundException } from "../common/exception/exception";
import { Permiso, PermisoDoc, PermisoModel} from "./modelPermiso";
import { CreatePerfilDto, CreatePerfilDto2, CreatePermisoDto } from "./dto";
import {StringUtils} from "../common/utils/string_utils"



export class PerfilDao{

    async getAllPermisos(): Promise<Array<Permiso>>{
        return( await PermisoModel.find({enabled: "true"}).exec())
        .map((doc: PermisoDoc) =>{
            return this.mapToPermiso(doc)
        })
    }

    async getAllPermisosDisabled(): Promise<Array<Permiso>>{
        return( await PermisoModel.find({enabled: "false"}).exec())
        .map((doc: PermisoDoc) =>{
            return this.mapToPermiso(doc)
        })
    }

    async findPermisoById(permisoId: String): Promise<Permiso> {
        const model = await PermisoModel.findById(permisoId).exec()
        if (!model) throw new ModelNotFoundException()
        return this.mapToPermiso(model)
    }

    async storePermiso(permiso: CreatePermisoDto): Promise<Permiso>{
        const permisoDoc = await PermisoModel.create({
            name: permiso.name,
            createdAt: permiso.createdAt,
            enabled: permiso.enabled
        }
        )
        return this.mapToPermiso(permisoDoc)
    } 

    async updatePermiso(id: string, permiso: CreatePermisoDto): Promise<Permiso>{
        const updated = await PermisoModel.findByIdAndUpdate(id,{
            name: permiso.name,
            createdAt: permiso.createdAt,
            enabled: permiso.enabled
        }).exec()
        if (!updated) {
            throw new ModelNotFoundException()
        }
        return this.mapToPermiso(updated)
    }

    async deletePermiso(id: string): Promise<Permiso>{
        const updated = await PermisoModel.findByIdAndDelete({_id: id}).exec()
        if (!updated) {
            throw new ModelNotFoundException()
        }
        return this.mapToPermiso(updated)
    }


    mapToPermiso(document: PermisoDoc): Permiso {
        return {
            id: document.id,
            name: document.name,
            createdAt: document.createdAt,
            enabled: document.enabled
        }
    }

    // Perfil

    async getAllPerfils(): Promise<Array<Perfil>> {
        return (await PerfilModel.find({}).populate('permisos').exec())
        .map((doc: PerfilDoc) =>{
            return this.mapToPerfil(doc)
        })
    }

    // //Para buscar un perfil con sus permisos asignados, hacemos uso de la funcion
    // //populate, esta funcion busca el/los id/s relacionados y trae su entidad/es
    // //generando asi un array con los permisos dentro del perfilbuscado
    async findPerfilById(perfilId: String): Promise<Perfil>{
        const model = await PerfilModel.findById(perfilId).populate("permisos").exec()
        if(!model) throw new ModelNotFoundException()
            return this.mapToPerfil(model)
    }    

    async updatePerfil(perfilId: String, perfil: CreatePerfilDto): Promise<Perfil>{
        const updated = await PerfilModel.findByIdAndUpdate(perfilId,{
            name: perfil.name,
            createdAt: perfil.createdAt,
            $push: {permisos: perfil.permisos}
        }).exec()
        if(!updated) {
            throw new ModelNotFoundException()
        }
        return this.mapToPerfil(updated)
    }

    
    async deletePermisoFromProfile(perfilId: String, perfil: CreatePerfilDto): Promise<Perfil>{
        const updated = await PerfilModel.findByIdAndUpdate(perfilId,{
            name: perfil.name,
            createdAt: perfil.createdAt,
            $pull: {permisos: perfil.permisos}
        }).exec()
        if(!updated) {
            throw new ModelNotFoundException()
        }
        return this.mapToPerfil(updated)
    }

    async store(perfil: CreatePerfilDto): Promise<Perfil>{
        const perfilDoc = await PerfilModel.create(
            {
                name: perfil.name,
                createdAt: perfil.createdAt,
            }
        )
        return this.mapToPerfil(perfilDoc)
    }
    async deletePerfil(id: string): Promise<Perfil>{
        const updated = await PerfilModel.findByIdAndDelete({_id: id}).exec()
        if (!updated) {
            throw new ModelNotFoundException()
        }
        return this.mapToPerfil(updated)
    }

    mapToPerfil(document: PerfilDoc): Perfil {
        return {
            name: document.name,
            createdAt: document.createdAt,
            deletedAt: document.deletedAt,
            id: document._id,
            permisos: document.permisos
        }
    }

    async addPermisosToPerfil(perfilId: string, permisos: string[]): Promise<Perfil> {
        const permisosObjectIds = this.convertToObjectIdArray(permisos);
        // Paso 1: Obtener el perfil actual para verificar si tiene el atributo permisos
        const perfilActual = await PerfilModel.findById(perfilId).exec();

        if (!perfilActual) {
            throw new Error("Perfil not found");
        }

        // Paso 2: Si el perfil tiene el atributo permisos, eliminarlo
        if (perfilActual.permisos) {
            await PerfilModel.updateOne(
                { _id: perfilId },
                { $unset: { permisos: "" } }
            ).exec();
        }

        // Paso 3: Actualizar el perfil con los nuevos permisos
        const updated = await PerfilModel.findByIdAndUpdate(
            perfilId,
            { $set: { permisos: permisosObjectIds } },
            { new: true } // Devuelve el documento actualizado
        ).exec();
    
        if (!updated) {
            throw new ModelNotFoundException();
        }
        return this.mapToPerfil(updated);
    }

     convertToObjectIdArray(ids: string[]): mongoose.Types.ObjectId[] {
        const uniqueIds = Array.from(new Set(ids)); // Elimina duplicados
        return uniqueIds.map(id => new mongoose.Types.ObjectId(id));
    }

}

export const instance = new PerfilDao()

