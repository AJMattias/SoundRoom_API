import { EstadoUsuario } from "./modelEU";
import { User } from "./models"

export class UserDto{
    id: string;
    name: string;
    last_name: string;
    email: string;
    password: string;
    idPerfil: string;
    idArtistType?: string;
    idArtistStyle?: string;
    createdAt?: Date;
    deletedAt?: Date;
    isAdmin: boolean;
    enabled: string;
    estadoUsuario?:[{type: string}];
    userType: string;
    idSalaDeEnsayo:[{type: string}];
    tipoArtista: string;
    opiniones?:[{type: string}];
    enabledHistory?: { status: string;dateFrom: Date, dateTo: Date}[];


    /**
     * 
    * @param {User} user 
    * @returns el dto para devolver al usuario
    */

    constructor(user: User){
        this.id = user.id
        this.name = user.name
        this.last_name = user.lastName
        this.email = user.email
        this.password = user.password
        this.idArtistType = user.idArtistType
        this.idArtistStyle = user.idArtistStyle
        this.idPerfil = user.idPerfil
        this.deletedAt = user.deletedAt
        this.createdAt = user.createdAt
        this.isAdmin= user.isAdmin
        this.enabled= user.enabled
        this.estadoUsuario = user.estadoUsuario
        this.userType = user.userType
        this.idSalaDeEnsayo= user.idSalaDeEnsayo
        this.tipoArtista= user.tipoArtista;
        this.opiniones = user.opiniones;
        this.enabledHistory = user.enabledHistory;
    
    }
}

export interface CreateUserDto {
    name: string;
    last_name: string;
    email: string;
    password: string;
    image_id: string|undefined;
    idArtistType: string|undefined;
    idArtistStyle: string|undefined;
    idPerfil?: string; 
    createdAt?: Date;
    deletedAt?: Date;
    enabled?: string;
    estadoUsuario?: EstadoUsuario;
    userType: string;
    idSalaDeEnsayo:string;
    tipoArtista: string; 
    opiniones?: string; 
    enabledHistory?: { status: string; dateFrom: Date, dateTo: Date }[]
    

}

export interface CreateUserDtoTwo {
    name: string;
    last_name: string;
    email: string;
    password: string;
    image_id: string|undefined;
    createdAt?: Date;
    deletedAt?: Date;
}
export interface LoginDto {
    email: string;
    password: string;
}

export interface LoginResponseDto{
    user : UserDto;
    token: string;
}

export interface LoginWithTokenDto {
    email: string;
    token: string;
}
export interface UsuariosNuevosFto{
    labels:[],
    datasets:[{data:[]}]
}

export interface addSalaToUserDto{
    id: string;
    name: string;
    last_name: string;
    email: string;
    password: string;
    image_id?: string|undefined;
    idArtistType: string|undefined;
    idArtistStyle: string|undefined;
    idPerfil: string; 
    createdAt?: Date;
    deletedAt?: Date;
    enabled: string;
    estadoUsuario?: EstadoUsuario;
    userType: string;
    idSalaDeEnsayo: string;
    
}




 
