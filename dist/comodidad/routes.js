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
const service = __importStar(require("./service"));
const validator = __importStar(require("express-validator"));
const run_1 = require("../common/utils/run");
const constants_1 = require("../common/utils/constants");
const validator_utils_1 = require("../common/utils/validator_utils");
/**
*
* @param {Express} app
*/
const route = (app) => {
    app.get("/comodidades/", (0, run_1.run)(async (req, resp) => {
        const comodidades = await service.instance.getAllComodidades();
        resp.json(comodidades);
    }));
    app.get("/comodidades/:id", (0, run_1.run)(async (req, resp) => {
        const comodidades = await service.instance.findComodidadById(`id`);
        resp.json(comodidades);
    }));
    app.post("/comodidades/", validator.body("name").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const error = validator.validationResult(req);
        if (error && !error.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(error.array());
        }
        const dto = req.body;
        const comodidad = await service.instance.createComodidad({
            name: dto["name"]
        });
        resp.json(comodidad);
    }));
};
exports.route = route;
