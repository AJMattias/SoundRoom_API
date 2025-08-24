// src/config/cloudinaryConfig.ts
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv'; // Importa dotenv aquí también si este archivo es el que accede a .env

// Asegúrate de cargar las variables de entorno si este es el primer lugar
// donde se usan o si no estás seguro de que server.ts las cargue antes de importar esto.
// Aunque lo ideal es que dotenv.config() esté en server.ts al inicio.
dotenv.config(); // Puedes ponerlo aquí como respaldo, pero preferiblemente en server.ts

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

export { cloudinary }; // Exporta la instancia configurada de Cloudinary