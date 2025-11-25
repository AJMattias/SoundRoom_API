// src/config/mercadopago.ts (ejemplo)
import {MercadoPagoConfig, Payment} from 'mercadopago';
import { Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ 
    accessToken: process.env.ACCESS_TOKEN || ""
});

// 2. Exporta el cliente de Preferencias
// Esto es lo que usarás para crear las preferencias de pago.
export const preferenceClient = new Preference(client);
export const paymentClient = new Payment(client);
