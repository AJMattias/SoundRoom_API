import { EstadoPagos } from "./enum";
import { IPagoMP } from "./model";

export class PagoMpDto{
    id?: string;
    type?: string;
    monto?: number;
    metodoPago?: string;
    estado?: EstadoPagos; 
    nroTransaccion?: string;
    usuario?: string;
    available?: boolean; 
    reserva?: string;
    collectionId?: string;
    collectionStatus?: string;
    externalReference?: string;
    merchantAccountId?: string;
    merchantOrderId?: string;
    paymentId?: string;
    preferenceId?: string;
    processingMode?: string;
    siteId?: string;
    paymentType?: string;
    status?: string;

    constructor (pagoMP: IPagoMP){
        this.id = pagoMP.id;
        this.type = pagoMP.type;
        this.merchantOrderId = pagoMP.merchantOrderId;
        this.monto = pagoMP.monto;
        this.metodoPago = pagoMP.metodoPago;
        this.estado = pagoMP.estado;
        this.nroTransaccion = pagoMP.nroTransaccion;
        this.usuario = pagoMP.usuario;
        this.available = pagoMP.available;
        this.reserva = pagoMP.reserva;
        this.collectionId = pagoMP.collectionId;
        this.collectionStatus = pagoMP.collectionStatus;
        this.externalReference = pagoMP.externalReference;
        this.merchantAccountId = pagoMP.merchantAccountId;
        this.paymentId = pagoMP.paymentId;
        this.preferenceId = pagoMP.preferenceId;
        this.processingMode = pagoMP.processingMode;
        this.siteId = pagoMP.siteId;
        this.paymentType = pagoMP.paymentType;
        this.status = pagoMP.status;
        
    }
}

export interface PreferenceItem {
  id: string;
  title: string;
  unit_price: number;
  quantity: number;
  currency_id?: 'ARS' | 'BRL' | 'CLP' | 'COP' | 'MXN' | 'PEN' | 'UYU';
  description?: string;
  picture_url?: string;
  category_id?: string;
  
}

export interface CreatePreferenceRequest {
  items: PreferenceItem[];
  payer?: {
    name?: string;
    surname?: string;
    email?: string;
    phone?: {
      area_code: string;
      number: string;
    };
    
  };
  back_urls?: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return?: 'approved' | 'all';
  notification_url?: string;
  statement_descriptor?: string;
  external_reference?: string;
  expires?: boolean;
  expiration_date_from?: string;
  expiration_date_to?: string;
}

export interface CreatePreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
  date_created: string;
}