"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDto = void 0;
class UserDto {
    /**
     *
    * @param {User} user
    * @returns el dto para devolver al usuario
    */
    constructor(user) {
        this.id = user.id;
        this.name = user.name;
        this.last_name = user.lastName;
        this.email = user.email;
        this.password = user.password;
        this.idArtistType = user.idArtistType;
        this.idArtistStyle = user.idArtistStyle;
        this.idPerfil = user.idPerfil;
        this.deletedAt = user.deletedAt;
        this.createdAt = user.createdAt;
        this.isAdmin = user.isAdmin;
        this.enabled = user.enabled;
        this.estadoUsuario = user.estadoUsuario;
        this.userType = user.userType;
        this.idSalaDeEnsayo = user.idSalaDeEnsayo;
        this.tipoArtista = user.tipoArtista;
        this.opiniones = user.opiniones;
        this.enabledHistory = user.enabledHistory;
    }
}
exports.UserDto = UserDto;
