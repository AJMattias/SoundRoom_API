import { Reporte } from "./modelReporte";

export class ReporteUsersDto{
    mes: number;
    cantidad: number;

    /**
     * 
    * @param {Reporte} reporte 
    * @returns el dto para devolver al usuario
    */

    constructor (reporte: Reporte){
        this.mes = reporte.mes,
        this.cantidad = reporte.cantidad;
    }
}