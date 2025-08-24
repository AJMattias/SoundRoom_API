import { Comision, EnabledHistory } from "./model"; 

export class ComisionDto{
    id: string;
    porcentaje: number;
    createdAt: Date;
    deletedAt?: Date;
    enabled: string;
    // enabledHistory?: { status: string;dateFrom: Date, dateTo: Date}[];
    enabledHistory: EnabledHistoryDto[];


    constructor(comision: Comision){
        this.id= comision.id
        this.porcentaje= comision.porcentaje
        this.createdAt= comision.createdAt
        this.deletedAt= comision.deletedAt
        this.enabled= comision.enabled
        this.enabledHistory = comision.enabledHistory.map(history => new EnabledHistoryDto(history));

    }
}

export class EnabledHistoryDto { 
    id: string; status: string; dateFrom: Date; dateTo?: Date 

    constructor(enabledHistory: EnabledHistory){
        this.id = enabledHistory.id;
        this.status= enabledHistory.status;
        this.dateFrom= enabledHistory.dateFrom;
        this.dateTo= enabledHistory.dateTo;
    }
}

export interface CreateEnabledHistory2{
    id?: string; status?: string; dateFrom?: Date; dateTo?: Date
}

export interface CreateEnabledHistory{
    status: string; dateFrom: Date, dateTo?: Date,
}

export interface CreateComisionDto{
    id?: string
    porcentaje: number;
    enabled?: string;
    createdAt?: Date;
    deletedAt?: Date
   // enabledHistory?: { status: string; dateFrom: Date, dateTo: Date|null }
   enabledHistory?: CreateEnabledHistory;
}

export interface ComisionDto2{
    id?: string
    porcentaje: number;
    enabled?: string;
    createdAt?: Date;
    deletedAt?: Date
   // enabledHistory?: { status: string; dateFrom: Date, dateTo: Date }[]
   enabledHistory?: CreateEnabledHistory2;
}

export interface UpdateHistoryDto {
    id?: string, 
    status?: string; 
    dateFrom?: Date, 
    dateTo?: Date 
}