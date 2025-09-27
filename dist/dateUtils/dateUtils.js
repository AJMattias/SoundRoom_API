"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ultimoDia = void 0;
const ultimoDia = (month) => {
    let meses = [
        { mes: ["Enero", "Marzo", "Mayo", "Julio", "Agosto", "Octubre", "Diciembre"], dias: 31 },
        { mes: ["Abril", "Junio", "Septiembre", "Noviembre"], dias: 30 }
    ];
    function getCantidadDiasMes(month) {
        meses.forEach(item => {
            let itemMes = item.mes;
            itemMes.forEach(element => {
                if (element == month) {
                    return 31;
                }
                else {
                    return 30;
                }
            });
        });
    }
};
exports.ultimoDia = ultimoDia;
