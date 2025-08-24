// import { UserModel } from "src/users/models";
// import {TempCodeModel} from "./model";
// import nodemailer from "nodemailer";

// //creacion y envio de codigo para recuperar cuenta
// export const sendVerificationCode = async (email: string) => {
//   const user = await UserModel.findOne({ email });

//   if (!user) {
//     throw new Error("El usuario no existe.");
//   }

//   // Generar un código de 6 dígitos
//   const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

//   // Guardar el código con expiración de 10 minutos
//   //tempCode.verificationCode = verificationCode;
//   const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
//   await TempCodeModel.create({
//     email: user.email,
//     password: user.
//   });

//   // Configurar y enviar el correo
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: "soundroomapp@gmail.com",
//       pass: "gmxm xwyi wcmx lodr" // Usa variables de entorno en producción
//     }
//   });

//   await transporter.sendMail({
//     from: '"SoundRoom" <soundroomapp@gmail.com>',
//     to: tempCode.email,
//     subject: "Código de verificación",
//     html: `
//       <p>Tu código de verificación es:</p>
//       <h2>${verificationCode}</h2>
//       <p>Este código expira en 10 minutos.</p>
//     `
//   });

//   return { message: "Código de verificación enviado al correo." };
// };

// //
