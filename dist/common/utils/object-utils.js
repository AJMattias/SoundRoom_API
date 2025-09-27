"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterUndefined = void 0;
// Define la función como una constante para asegurar que no se reasigne.
const filterUndefined = (obj) => {
    return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));
};
exports.filterUndefined = filterUndefined;
