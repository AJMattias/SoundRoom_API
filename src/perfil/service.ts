import * as dao from "./dao"
import { CreatePerfilDto, CreatePerfilDto2, CreatePermisoDto, PerfilDto, PermisoDto } from "./dto"
import { Permiso } from "./modelPermiso";
import { Perfil } from "./models"

export class PerfilService{
    /*@param {dao.PerfilDao} dao.PerfilDao*/
    dao: dao.PerfilDao;
    constructor(perfilDao: dao.PerfilDao){
        this.dao = perfilDao;
    }


    async createPerfil(dto: CreatePerfilDto): Promise<PerfilDto>{
        return this.mapToDto(
            await this.dao.store({
                name: dto.name,
                createdAt: new Date()
            })
        )
    }

    async findPerfilById(id: string) : Promise<PerfilDto>{
        const perfil = await this.dao.findPerfilById(id)
        return this.mapToDto(perfil)
    }

    async getAllPerfiles(): Promise<Array<PerfilDto>>{
        const perfiles = await this.dao.getAllPerfils()
        return perfiles.map((perfiles: Perfil) => {
            return this.mapToDto(perfiles)
        })
    }

    // UpdatePerfil not only to update perfil name, also to add new permisos
    async updatePerfil(id: string, dto: CreatePerfilDto): Promise<PerfilDto>{
        return this.mapToDto(
            await this.dao.updatePerfil(id, {
                name: dto.name,
                createdAt: new Date(),
                permisos: dto.permisos
            })
        )  
    }
    async addPermisoToPerfil(id: string, dto: CreatePerfilDto2): Promise<PerfilDto>{
        return this.mapToDto(
            await this.dao.addPermisosToPerfil(id, dto.permisos)
        )  
    }
    
    async deletePermisoFromPerfil(id: string, dto: CreatePerfilDto): Promise<PerfilDto>{
        return this.mapToDto(
            await this.dao.deletePermisoFromProfile(id, {
                name: dto.name,
                createdAt: new Date(),
                permisos: dto.permisos
            })
        )  
    }

    async deletePerfil(id: string): Promise<PerfilDto>{
        return this.mapToDto(
            await this.dao.deletePerfil(id)
        )  
    }




    mapToDto(perfil: Perfil) : PerfilDto{
        return{
            name: perfil.name,
            id: perfil.id,
            permisos: perfil.permisos,
        }
    }

    // Para Permisos

    mapToDtoP(permiso: Permiso) : PermisoDto{
        return{
            id: permiso.id,
            name: permiso.name,
            enabled: permiso.enabled
        }
    }


    async createPermiso(dtoPermiso: CreatePermisoDto): Promise<PermisoDto>{
        return this.mapToDtoP(
            await this.dao.storePermiso({
                name: dtoPermiso.name,
                createdAt: new Date(),
                enabled: "true"
            }
            )
        )
    }

    async getAllPermisos(): Promise<Array<PermisoDto>>{
        const permiso = await this.dao.getAllPermisos()
        return permiso.map((permiso: Permiso) =>{
            return this.mapToDtoP(permiso)
        })
    }
    
    async getAllPermisosDisabled(): Promise<Array<PermisoDto>>{
        const permiso = await this.dao.getAllPermisosDisabled()
        return permiso.map((permiso: Permiso) =>{
            return this.mapToDtoP(permiso)
        })
    }

    async findPermisoById(id: string): Promise<PermisoDto>{
        const permiso = await this.dao.findPermisoById(id)
        return this.mapToDtoP(permiso)
    }

    async updatePermiso(id: string, dto: CreatePermisoDto): Promise<PermisoDto>{
        return this.mapToDtoP(
            await this.dao.updatePermiso(id, {
                name: dto.name,
                createdAt: new Date(),
                enabled: "true",
            })
        )
    }
    async deletePermiso(id: string): Promise<PermisoDto>{
        return this.mapToDtoP(
            await this.dao.deletePermiso(id)
            // , {
            //     name: dto.name,
            //     deletedAt: new Date(),
            //     enabled:false,
            // }
            )
    }


}
export const instance = new PerfilService(dao.instance)