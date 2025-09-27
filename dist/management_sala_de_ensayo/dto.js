"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateSalaEnsayoDto = exports.TypeDto = void 0;
class TypeDto {
    constructor(type) {
        this.name = type.name;
        this.id = type.id;
    }
}
exports.TypeDto = TypeDto;
class StateSalaEnsayoDto {
    constructor(stateSalaEnsayo) {
        this.name = stateSalaEnsayo.name;
    }
}
exports.StateSalaEnsayoDto = StateSalaEnsayoDto;
