"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.route = void 0;
const run_1 = require("../common/utils/run");
const middleware_1 = require("../server/middleware");
const service_1 = require("./service");
const validator = __importStar(require("express-validator"));
const route = (app) => {
    app.post("/email/send/", middleware_1.auth, validator.body("message").notEmpty(), validator.body("to").isEmail(), (0, run_1.run)(async (req, resp) => {
        await service_1.mailService.sendMessage(req.body.to, req.body.message);
        resp.send({ result: 'msj enviado' });
    }));
};
exports.route = route;
