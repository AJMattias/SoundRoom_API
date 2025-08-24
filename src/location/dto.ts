import { Province } from "./models"
import { Locality} from "./modelsL"

export class LocalityDto{
    nameLocality: string;
    idProvince: string;
    /**
     * 
    * @param {Locality} Locality 
    * @returns el dto para devolver a nombre de localidad
    */

    constructor(locality: Locality){
        this.nameLocality = locality.nameLocality
        this.idProvince = locality.idProvince
    }
}

export class ProvinceDto{
    nameProvince: string;
    /**
     * 
    * @param {Province} Province 
    * @returns el dto para devolver a nombre de localidad
    */

    constructor(province: Province){
        this.nameProvince = province.nameProvince
    }
}