import { Type, StateSalaEnsayo} from "./models"

export class TypeDto{
    name: String;
    id?: string;


    constructor(type: Type){
        this.name = type.name;
        this.id = type.id;
    }
}
export interface CreateType{
    name:string;
    createdAt?: Date;
}

export class StateSalaEnsayoDto{
    name: String;


    constructor(stateSalaEnsayo: StateSalaEnsayo){
        this.name = stateSalaEnsayo.name;
    }
}