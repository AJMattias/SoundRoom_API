import { Configuracion} from "./models"

export class ConfiguracionDto{
    tiempoBloqueo : Number;
    maximoIntentos : Number;
    porcentajeComision : Number;
    createdAt : Date;
    deletedAt?: Date;

    constructor(configuracion: Configuracion){
        this.tiempoBloqueo = configuracion.tiempoBloqueo;
        this.maximoIntentos = configuracion.maximoIntentos;
        this.porcentajeComision = configuracion.porcentajeComision;
        this.createdAt = configuracion.createdAt;
        this.deletedAt = configuracion.deletedAt;
    }
}