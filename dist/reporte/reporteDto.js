"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReporteUsersDto = void 0;
class ReporteUsersDto {
    /**
     *
    * @param {Reporte} reporte
    * @returns el dto para devolver al usuario
    */
    constructor(reporte) {
        this.mes = reporte.mes,
            this.cantidad = reporte.cantidad;
    }
}
exports.ReporteUsersDto = ReporteUsersDto;
