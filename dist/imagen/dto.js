"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagenDto = void 0;
class ImagenDto {
    constructor(imagen) {
        this.url = imagen.url;
        this.titulo = imagen.titulo;
        this.descripcion = imagen.descripcion;
        this.visible = imagen.visible;
        this.createdAt = imagen.createdAt;
        this.deletedAt = imagen.deletedAt;
        this.public_id = imagen.public_id;
    }
}
exports.ImagenDto = ImagenDto;
