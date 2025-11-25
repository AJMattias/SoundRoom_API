import { Document, Schema, model,  ObjectId } from "mongoose";
import { EstadoPagos } from "./enum";

export interface IPagoMP{
    // Atributos base
  id: string;
  type: string;
  monto: number; // float8
  metodoPago: string;
  estado: EstadoPagos; // Usamos el enum o un string si prefieres
  nroTransaccion: string;
  usuario: string;
  available: boolean; // bool
  reserva: string;

  // Atributos de Mercado Pago
  collectionId: string;
  collectionStatus: string;
  externalReference: string;
  merchantAccountId: string;
  merchantOrderId: string;
  paymentId: string;
  preferenceId: string;
  processingMode: string;
  siteId: string;
  paymentType: string;
  status: string;
}

export interface PagoMPDoc extends Document{
   
  id: string;
  monto: number;
  metodoPago: string;
  estado: EstadoPagos; 
  nroTransaccion: string;
  usuario: string;
  available: boolean; 
  reserva: string;
  collectionId: string;
  collectionStatus: string;
  externalReference: string;
  merchantAccountId: string;
  merchantOrderId: string;
  paymentId: string;
  preferenceId: string;
  processingMode: string;
  siteId: string;
  paymentType: string;
  status: string;

}

export const PagoMPSchema = new Schema(
  {
    // Atributos base
    monto: { type: Number, required: true }, // Mapea float8 a Number
    metodoPago: { type: String, required: true },
    estado: { 
      type: String, 
      enum: Object.values(EstadoPagos), // Usa el enum para validación
      default: EstadoPagos.EN_PROCESO,
      required: true 
    },
    nroTransaccion: { type: String, required: false, default: null },
    usuario: { type: String, required: true, index: true }, // Indexamos para búsquedas rápidas por cliente
    reserva: { type: String, required: true, index: true }, // Indexamos para búsquedas rápidas por orden
    available: { type: Boolean, required: true, default: true },

    // Atributos de Mercado Pago (todos mapeados a String, ya que son texto/ID)
    collectionId: { type: String, default: null },
    collectionStatus: { type: String, default: null },
    externalReference: { type: String, default: null },
    merchantAccountId: { type: String, default: null },
    merchantOrderId: { type: String, default: null },
    paymentId: { type: String, default: null },
    preferenceId: { type: String, default: null },
    processingMode: { type: String, default: null },
    siteId: { type: String, default: null },
    paymentType: { type: String, default: null },
    status: { type: String, default: null },

  },
  {
    timestamps: true, // Esto crea automáticamente createdAt y updatedAt
    collection: 'pagos', // Nombre de la colección en MongoDB
  },
);

export const PagoMPModel = model<any>('PagoMP', PagoMPSchema);