import { Comodidad} from "./models"

export class ComodidadDto{
    name: String;


    constructor(comodidad: Comodidad){
        this.name = comodidad.name;
    }
}