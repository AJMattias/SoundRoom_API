"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtistTypeDto = exports.ArtistStyleDto = void 0;
class ArtistStyleDto {
    /**
     *
    * @param {ArtistStyle} ArtistStyle
    * @returns el dto para devolver a nombre de localidad
    */
    constructor(artistStyle) {
        this.nameArtistStyle = artistStyle.nameArtistStyle;
        this.id = artistStyle.id;
        this.idArtistType = artistStyle.idArtistType;
    }
}
exports.ArtistStyleDto = ArtistStyleDto;
class ArtistTypeDto {
    /**
     *
    * @param {ArtistType} ArtistType
    * @returns el dto para devolver a nombre de localidad
    */
    constructor(artistType) {
        this.nameArtistType = artistType.nameArtistType;
        this.id = artistType.id;
    }
}
exports.ArtistTypeDto = ArtistTypeDto;
