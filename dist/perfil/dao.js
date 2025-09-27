"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.instance = exports.PerfilDao = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const models_1 = require("./models");
const exception_1 = require("../common/exception/exception");
const modelPermiso_1 = require("./modelPermiso");
class PerfilDao {
    async getAllPermisos() {
        return (await modelPermiso_1.PermisoModel.find({ enabled: "true" }).exec())
            .map((doc) => {
            return this.mapToPermiso(doc);
        });
    }
    async getAllPermisosDisabled() {
        return (await modelPermiso_1.PermisoModel.find({ enabled: "false" }).exec())
            .map((doc) => {
            return this.mapToPermiso(doc);
        });
    }
    async findPermisoById(permisoId) {
        const model = await modelPermiso_1.PermisoModel.findById(permisoId).exec();
        if (!model)
            throw new exception_1.ModelNotFoundException();
        return this.mapToPermiso(model);
    }
    async storePermiso(permiso) {
        const permisoDoc = await modelPermiso_1.PermisoModel.create({
            name: permiso.name,
            createdAt: permiso.createdAt,
            enabled: permiso.enabled
        });
        return this.mapToPermiso(permisoDoc);
    }
    async updatePermiso(id, permiso) {
        const updated = await modelPermiso_1.PermisoModel.findByIdAndUpdate(id, {
            name: permiso.name,
            createdAt: permiso.createdAt,
            enabled: permiso.enabled
        }).exec();
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToPermiso(updated);
    }
    async findPerfilesByPermisoId(idPermiso) {
        const objectId = new mongoose_1.default.Types.ObjectId(idPermiso);
        const perfiles = await models_1.PerfilModel.find({
            permisos: objectId
        }).exec(); // Solo para emergencias
        return perfiles.map((doc) => this.mapToPerfil(doc));
    }
    async deletePermiso(id) {
        const todosPerfiles = await models_1.PerfilModel.find().exec();
        const permisoId = new mongoose_1.default.Types.ObjectId(id);
        for (const perfil of todosPerfiles) {
            // Convertir permisos a array de strings para comparar
            const permisosStrings = perfil.permisos?.map(p => p.toString()) || [];
            if (permisosStrings.includes(permisoId.toString())) {
                // Filtrar y mantener como ObjectId
                const nuevosPermisos = perfil.permisos?.filter(p => p.toString() !== permisoId.toString()) || [];
                // Actualizar con type assertion
                await models_1.PerfilModel.findByIdAndUpdate(perfil._id, { permisos: nuevosPermisos }, // <--- Solución clave
                { new: true }).exec();
            }
        }
        const deleted = await modelPermiso_1.PermisoModel.findByIdAndDelete(permisoId).exec();
        if (!deleted)
            throw new exception_1.ModelNotFoundException();
        return { msg: true };
    }
    mapToPermiso(document) {
        return {
            id: document.id,
            name: document.name,
            createdAt: document.createdAt,
            enabled: document.enabled
        };
    }
    // Perfil
    async getAllPerfils() {
        return (await models_1.PerfilModel.find({}).populate('permisos').exec())
            .map((doc) => {
            return this.mapToPerfil(doc);
        });
    }
    //Para buscar un perfil con sus permisos asignados, hacemos uso de la funcion
    //populate, esta funcion busca el/los id/s relacionados y trae su entidad/es
    //generando asi un array con los permisos dentro del perfilbuscado
    async findPerfilById(perfilId) {
        const model = await models_1.PerfilModel.findById(perfilId).populate("permisos").exec();
        if (!model)
            throw new exception_1.ModelNotFoundException();
        return this.mapToPerfil(model);
    }
    async updatePerfil(perfilId, perfil) {
        const updated = await models_1.PerfilModel.findByIdAndUpdate(perfilId, {
            name: perfil.name,
            createdAt: perfil.createdAt,
            $push: { permisos: perfil.permisos }
        }).exec();
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToPerfil(updated);
    }
    async deletePermisoFromProfile(perfilId, perfil) {
        const updated = await models_1.PerfilModel.findByIdAndUpdate(perfilId, {
            name: perfil.name,
            createdAt: perfil.createdAt,
            $pull: { permisos: perfil.permisos }
        }).exec();
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToPerfil(updated);
    }
    async store(perfil) {
        const perfilDoc = await models_1.PerfilModel.create({
            name: perfil.name,
            createdAt: perfil.createdAt,
        });
        return this.mapToPerfil(perfilDoc);
    }
    async deletePerfil(id) {
        const updated = await models_1.PerfilModel.findByIdAndDelete({ _id: id }).exec();
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToPerfil(updated);
    }
    mapToPerfil(document) {
        return {
            name: document.name,
            createdAt: document.createdAt,
            deletedAt: document.deletedAt,
            id: document._id,
            permisos: document.permisos
        };
    }
    // async addPermisosToPerfil(perfilId: string, permisos: string[]): Promise<Perfil> {
    //     console.log('permisos a actualizar en perfil: ', permisos)
    //     const permisosObjectIds = this.convertToObjectIdArray(permisos);
    //     // Paso 1: Obtener el perfil actual para verificar si tiene el atributo permisos
    //     const perfilActual = await PerfilModel.findById(perfilId).exec();
    //     if (!perfilActual) {
    //         throw new Error("Perfil not found");
    //     }
    //     // Paso 2: Si el perfil tiene el atributo permisos, eliminarlo
    //     if (perfilActual.permisos) {
    //         await PerfilModel.updateOne(
    //             { _id: perfilId },
    //             { $unset: { permisos: "" } }
    //         ).exec();
    //     }
    //     // Paso 3: Actualizar el perfil con los nuevos permisos
    //     const updated = await PerfilModel.findByIdAndUpdate(
    //         perfilId,
    //         { $set: { permisos: permisosObjectIds } },
    //         { new: true } // Devuelve el documento actualizado
    //     ).exec();
    //     console.log('permisos de perfil actualizado', updated)
    //     if (!updated) {
    //         throw new ModelNotFoundException();
    //     }
    //     return this.mapToPerfil(updated);
    // }
    async addPermisosToPerfil(perfilId, permisos) {
        console.log('permisos a actualizar en perfil: ', permisos);
        const permisosObjectIds = this.convertToObjectIdArray(permisos);
        // Paso 1: Obtener el perfil actual para verificar si tiene el atributo permisos
        const perfilActual = await models_1.PerfilModel.findById(perfilId).exec();
        if (!perfilActual) {
            throw new Error("Perfil not found");
        }
        // Paso 2: Si el perfil tiene el atributo permisos, eliminarlo
        if (perfilActual.permisos) {
            const perfilSinPermisos = await models_1.PerfilModel.updateOne({ _id: perfilId }, { $unset: { permisos: "" } }).exec();
            console.log('perfilSinPermisos :', perfilSinPermisos);
        }
        // Paso 3: Actualizar el perfil con los nuevos permisos
        const updated = await models_1.PerfilModel.findByIdAndUpdate(perfilId, { $set: { permisos: permisosObjectIds } }, { new: true, useFindAndModify: false }).exec();
        console.log('permisos de perfil actualizado', updated);
        if (!updated) {
            throw new exception_1.ModelNotFoundException();
        }
        return this.mapToPerfil(updated);
    }
    convertToObjectIdArray(ids) {
        const uniqueIds = Array.from(new Set(ids)); // Elimina duplicados
        return uniqueIds.map(id => new mongoose_1.default.Types.ObjectId(id));
    }
}
exports.PerfilDao = PerfilDao;
exports.instance = new PerfilDao();
