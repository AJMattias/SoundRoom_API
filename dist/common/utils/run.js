"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const run = (callback) => {
    return async (req, res, next) => {
        try {
            await callback(req, res);
        }
        catch (err) {
            next(err);
        }
    };
};
exports.run = run;
