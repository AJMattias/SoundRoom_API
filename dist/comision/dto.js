"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnabledHistoryDto = exports.ComisionDto = void 0;
class ComisionDto {
    constructor(comision) {
        this.id = comision.id;
        this.porcentaje = comision.porcentaje;
        this.createdAt = comision.createdAt;
        this.deletedAt = comision.deletedAt;
        this.enabled = comision.enabled;
        this.enabledHistory = comision.enabledHistory.map(history => new EnabledHistoryDto(history));
    }
}
exports.ComisionDto = ComisionDto;
class EnabledHistoryDto {
    constructor(enabledHistory) {
        this.id = enabledHistory.id;
        this.status = enabledHistory.status;
        this.dateFrom = enabledHistory.dateFrom;
        this.dateTo = enabledHistory.dateTo;
    }
}
exports.EnabledHistoryDto = EnabledHistoryDto;
