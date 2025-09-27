"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvinceDto = exports.LocalityDto = void 0;
class LocalityDto {
    /**
     *
    * @param {Locality} Locality
    * @returns el dto para devolver a nombre de localidad
    */
    constructor(locality) {
        this.nameLocality = locality.nameLocality;
        this.idProvince = locality.idProvince;
    }
}
exports.LocalityDto = LocalityDto;
class ProvinceDto {
    /**
     *
    * @param {Province} Province
    * @returns el dto para devolver a nombre de localidad
    */
    constructor(province) {
        this.nameProvince = province.nameProvince;
    }
}
exports.ProvinceDto = ProvinceDto;
