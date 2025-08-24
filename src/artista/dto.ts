import { ArtistType } from "./modelsType"
import { ArtistStyle } from "./modelsStyle"

export class ArtistStyleDto{
    nameArtistStyle: string;
    id: string;
    idArtistType: string;
    /**
     * 
    * @param {ArtistStyle} ArtistStyle 
    * @returns el dto para devolver a nombre de localidad
    */

    constructor(artistStyle: ArtistStyle){
        this.nameArtistStyle = artistStyle.nameArtistStyle
        this.id = artistStyle.id
        this.idArtistType = artistStyle.idArtistType
    }
}

export class ArtistTypeDto{
    nameArtistType: string;
    id: string
    /**
     * 
    * @param {ArtistType} ArtistType 
    * @returns el dto para devolver a nombre de localidad
    */

    constructor(artistType: ArtistType){
        this.nameArtistType = artistType.nameArtistType
        this.id = artistType.id
    }
}