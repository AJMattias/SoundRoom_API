import * as dotenv from "dotenv"
import * as express from "express"
import * as jwt from "jsonwebtoken"
import {AuthenticationException, AuthorizationException, ServerException} from "../common/exception/exception"
import {Application, Request, Response, NextFunction} from "express"
import * as  rateLimiter  from "express-rate-limit"
import helmet from "helmet"
import {ApiQuotaException}  from "../common/exception/exception.js"
import { UserDto } from "../users/dto"
import { UserModel } from "../users/models"
import { PerfilModel } from "../perfil/models"
const cors = require("cors")
/**
 *  Acá se configuran todos los middleware globales de nuestra app.
 *  @param {Express} app
 */
export const middleware = (app: Application) => {
    app.use(express.json())
    app.use(defaultRateLimiter())
    app.use(helmet())   //Varias configuraciones de seguridad
    app.use(cors())
}


/**
 *  Rate limiter:  Limitamos la cantidad de requests que un usuario puede realizar por minuto.
 */
export function defaultRateLimiter() {
    const windowTime : number = process.env.MAX_REQUEST_WINDOW? parseInt(process.env.MAX_REQUEST_WINDOW) : 1
    const maxTimes :  number = process.env.MAX_REQUEST_NUMBER?  parseInt(process.env.MAX_REQUEST_NUMBER) : 100
    return rateLimiter.default({
        windowMs : windowTime * 1000,
        max:  maxTimes,
        handler : (req : any,res: any) =>{
            console.log(`ApiQuota exceeded for ip ${req.connection.remoteAddress}`)
            throw new ApiQuotaException(60000)
        }
    })
}

/**
 * Devuelve un middleware para limitar ciertas rutas con un menor nro de requests por minuto permitidas.
 * @param {Int} maxRequests 
 * @returns {rateLimiter.RateLimit}
 */
export const quota = (maxRequests: number) => {
    const windowTime =  process.env.MAX_REQUEST_WINDOW ? parseInt(process.env.MAX_REQUEST_WINDOW) : 1
    return rateLimiter.default({
        windowMs : windowTime * 1000,
        max: maxRequests,
        handler : (req,res) =>{
            console.log(`ApiQuota exceeded for ip ${req.connection.remoteAddress}`)
            throw new ApiQuotaException(60000)
        }
    })
} 


export const auth =  function (req : any , resp:  any, next : any) {
        console.log("auth()")
        var token = req.header("Authorization")
        if(!token) {
           console.error("Emtpy token") 
           return (new AuthenticationException()).send(resp)
            
        }
        token = token.replace("Bearer ","")
        const jwtKey =  process.env.JWT_KEY
        if(!jwtKey){
            console.error("empty jwtKey")
            const err = new ServerException()
            return err.send(resp)
        }
        try {
            const decoded = jwt.verify(token,jwtKey)
            req.user = decoded
            console.log('auth, req.user', req.user)
            next()
        } catch(error){
             return (new AuthenticationException()).send(resp)
        }

}

export const admin = function(req: any, resp: any, next: any) {
    const user: UserDto = req.user
    if(user && user.isAdmin) {
        console.log('user.isAdmin: ', user.isAdmin)
       next() 
    } else {
        return (new AuthorizationException()).send(resp)
    }
}

//middleware tiene permisos:
interface AuthenticatedRequest extends Request {
    user?: any;
  }
  
  //se llama con checkPermission(['CREAR_SALA_DE_ENSAYO']), // Verificación de permisos
  export const checkPermission = (requiredPermisos: string[]) => {
    return async (req: AuthenticatedRequest, resp: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
      
            if (!token) {
              return resp.status(401).json({ message: 'Acceso no autorizado' });
            }
      
            const secretKey = process.env.JWT_KEY;
            if (!secretKey) {
                console.error("empty jwtKey")
                const err = new ServerException()
                return err.send(resp)
            }
      
            // Verificar y decodificar el token
            const decoded = jwt.verify(token, secretKey);
            req.user = decoded;

            //isAdmin?
            const userAdmin: UserDto = req.user
            if(userAdmin && userAdmin.isAdmin) {
                next() 
                // } else {
                // return (new AuthorizationException()).send(resp)
            }
      
            // Obtener el perfil del usuario
            const user = await UserModel.findById(req.user.id).populate('idPerfil');
            if (!user) {
              return resp.status(404).json({ message: 'Usuario no encontrado' });
            }
      
            //TODO: verificar si es admin no buscar perfil
            if(user.isAdmin === false){
                const perfil = await PerfilModel.findById(user.idPerfil).populate('permisos');
                if (!perfil) {
                return resp.status(404).json({ message: 'Perfil no encontrado' });
                }
                
            
                // Filtrar permisos habilitados y extraer los nombres de permisos
                const userPermisos = perfil.permisos
                    ?.filter((permiso: any) => permiso.enabled === 'true') // Solo permisos habilitados
                    .map((permiso: any) => permiso.name.toUpperCase().replace(/ /g, '_')) || [];
            
                // Normalizar los permisos requeridos
                const normalizedRequiredPermisos = requiredPermisos.map(permiso => permiso.toUpperCase().replace(/ /g, '_'));

                // Verificar si el usuario tiene los permisos requeridos
                //const hasPermission = requiredPermisos.every(permiso => userPermisos.includes(permiso));
                
                const hasPermission = normalizedRequiredPermisos.every(permiso => userPermisos.includes(permiso));
                
                if (!hasPermission) {
                    return resp.status(403).json({ message: 'No tienes los permisos necesarios' });
                }
            
                // Si tiene permisos, continuar con la siguiente función middleware o controlador
                next();
            }
          } catch (error) {
            console.error(error);
            resp.status(500).json({ message: 'Error del servidor' });
          }
    };
  };

  // el perfil es artista o sala de ensayo: para crear sala de ensayo:
  export const checkArtistOrSalaDeEnsayo = async (req: any, res: Response, next: NextFunction) => {
    try {
        const user = req.user; // Usuario decodificado del token
        if (!user || !user.idPerfil) {
            return res.status(403).json({ message: "Acceso denegado: Usuario no autenticado o sin perfil" });
        }

        const perfil = await PerfilModel.findById(user.idPerfil).exec();
        if (!perfil) {
            return res.status(403).json({ message: "Acceso denegado: Perfil no encontrado" });
        }

        const validProfiles = ["Artista", "Sala de Ensayo"];
        if (validProfiles.includes(perfil.name)) {
            next();
        } else {
            return res.status(403).json({ message: "Acceso denegado: Perfil no autorizado" });
        }
    } catch (error) {
        console.error("Error en checkArtistOrSalaDeEnsayo:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

