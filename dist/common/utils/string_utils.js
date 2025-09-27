"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringUtils = void 0;
const mongoose_1 = require("mongoose");
const exception_1 = require("../exception/exception");
/**
 * Clase Helper que nos permite manejar cosas relacionadas a Strings
 * cualquier utilidad de Stringsd debe ir aca.
 */
exports.StringUtils = {
    toObjectId(str) {
        try {
            return new mongoose_1.Schema.Types.ObjectId(str);
        }
        catch (ex) {
            console.error("Got wrong objectId : " + str);
            throw new exception_1.ModelNotFoundException();
        }
    },
    isString(obj) {
        return obj != undefined && typeof (obj) == "string";
    },
    isNotEmpty(str) {
        return str != null && str.length > 0;
    },
    isEmail(str) {
        const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return this.isString(str)
            && regex.test(str);
    }
};
