// require('dotenv').config()
// import mongoose from "mongoose"
// // Connects to the local database. In the future it could be anything
// export const connect  = async () =>{
//     try{
//          //await mongoose.connect(`mongodb://localhost/${process.env.MONGO_DB_NAME}`)
//         // await mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.MONGO_DB_NAME}`, 
        
//         //version atlas: 
//        //await mongoose.connect(`mongodb+srv://ale_mat:eamale123@cluster0.l3izy.mongodb.net/${process.env.MONGO_DB_NAME}`, 
       
//         const mongoUri = process.env.MONGO_URI;
//         if (!mongoUri) {
//             throw new Error('No Mongo URI defined in environment variables');
//         }
//         await mongoose.connect(mongoUri,{
//            })
//         mongoose.set('returnOriginal', false)
//         console.log('database connected, con pool limitado')
//     } catch (e){
//         console.error("Error connecting to mongoose")
//         console.error(e)
//         throw e
//     }
// }

// // , {useNewUrlParser: true, useUnifiedTopology: true}

// -----------------Version funcional para Vercel (Serverless) con pool limitado y cache global
    
//require('dotenv').config()
// import mongoose from "mongoose"

// // Define el tipo para el cache global
// interface MongooseCache {
//   conn: typeof mongoose | null;
//   promise: Promise<typeof mongoose> | null;
// }

// // Extiende el tipo global para TypeScript
// declare global {
//   var mongoose: MongooseCache | undefined;
// }

// // Cache para conexiones en Vercel - INICIALIZACIÓN CORREGIDA
// let cached: MongooseCache;

// if (!global.mongoose) {
//   cached = global.mongoose = { conn: null, promise: null };
// } else {
//   cached = global.mongoose;
// }

// export const connect = async (): Promise<typeof mongoose> => {
//   // Si ya hay conexión cacheada, usarla
//   if (cached.conn) {
//     return cached.conn;
//   }

//   // Si no hay promesa de conexión, crear una
//   if (!cached.promise) {
//     const mongoUri = process.env.MONGO_URI;
//     if (!mongoUri) {
//       throw new Error('No Mongo URI defined in environment variables');
//     }

//     const opts = {
//       // LÍMITES CRÍTICOS para Vercel
//       maxPoolSize: 3,              // MÁXIMO 3 conexiones
//       minPoolSize: 1,
//       maxIdleTimeMS: 15000,        // Cerrar conexiones idle después de 15s
//       socketTimeoutMS: 30000,      // Timeout de 30 segundos
//       serverSelectionTimeoutMS: 10000,
//       bufferCommands: false,       // IMPORTANTE para serverless
//     };

//     cached.promise = mongoose.connect(mongoUri, opts)
//       .then((mongoose) => {
//         console.log('Database connected with LIMITED pool');
//         return mongoose;
//       })
//       .catch((error) => {
//         console.error("Error connecting to mongoose:", error);
//         cached.promise = null;
//         throw error;
//       });
//   }

//   try {
//     cached.conn = await cached.promise;
//   } catch (error) {
//     cached.promise = null;
//     throw error;
//   }

//   return cached.conn;
// };


//------------------------------
//                nueva version
// -----------------------------

// database/db.js
// database/db.ts
import mongoose from "mongoose";

// Define el tipo para el cache global
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extiende el tipo global para TypeScript
declare global {
  var mongoose: MongooseCache | undefined;
}

// Cache para conexiones en Vercel
let cached: MongooseCache;

if (!global.mongoose) {
  cached = global.mongoose = { conn: null, promise: null };
} else {
  cached = global.mongoose;
}

export const connect = async (): Promise<typeof mongoose> => {
  // ✅ Si ya hay conexión activa, usarla
  if (cached.conn && mongoose.connection.readyState === 1) {
    console.log('🔄 Usando conexión existente');
    return cached.conn;
  }

  // ✅ Si hay conexión pero está cerrada, resetear cache
  if (cached.conn && mongoose.connection.readyState !== 1) {
    console.log('🔄 Conexión perdida, reconectando...');
    cached.conn = null;
    cached.promise = null;
  }

  // Si no hay promesa de conexión, crear una
  if (!cached.promise) {
    // 🔥 CORRECCIÓN 1: Usar MONGODB_URI o MONGO_URI (compatibilidad)
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('❌ No MongoDB URI defined in environment variables');
    }

    console.log('🔗 Conectando a MongoDB...');

    const opts = {
      maxPoolSize: 3,              // MÁXIMO 3 conexiones para Vercel
      minPoolSize: 1,
      maxIdleTimeMS: 15000,        // Cerrar conexiones idle después de 15s
      socketTimeoutMS: 30000,      
      serverSelectionTimeoutMS: 10000,
      bufferCommands: false,       // CRÍTICO para serverless
      family: 4,                   // 🔥 CORRECCIÓN 2: Forzar IPv4
    };

    cached.promise = mongoose.connect(mongoUri, opts)
      .then((mongoose) => {
        console.log('✅ Database connected successfully');
        console.log(`📊 ReadyState: ${mongoose.connection.readyState}`);
        return mongoose;
      })
      .catch((error) => {
        console.error("❌ Error connecting to mongoose:", error);
        cached.promise = null; // Resetear para futuros intentos
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
};

// 🔥 CORRECCIÓN 3: Función para verificar estado
export const getConnectionStatus = () => {
  return {
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    isConnected: mongoose.connection.readyState === 1
  };
};

// 🔥 CORRECCIÓN 4: Función para cerrar conexión (útil para testing)
export const disconnect = async () => {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('🔄 MongoDB disconnected');
  }
};