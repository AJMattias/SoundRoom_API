import { Locality, Province } from "./models"

export class LocalityDto{
    nameLocality: string;
    id: string
    /**
     * 
    * @param {Locality} Locality 
    * @returns el dto para devolver a nombre de localidad
    */

    constructor(locality: Locality){
        this.nameLocality = locality.nameLocality
        this.id = locality.id
    }
}

export class ProvinceDto{
    nameProvince: string;
    id: string
    /**
     * 
    * @param {Province} Province 
    * @returns el dto para devolver a nombre de localidad
    */

    constructor(province: Province){
        this.nameProvince = province.nameProvince
        this.id = province.id
    }
}