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
const middleware_1 = require("../server/middleware");
/**
*
* @param {Express} app
*/
const route = (app) => {
    //para los estados de la sala de ensayo
    app.get("/managementState/", middleware_1.auth, (0, run_1.run)(async (req, resp) => {
        const stateSalaEnsayo = await service.instance.getAllStateSalaEnsayos();
        resp.json(stateSalaEnsayo);
    }));
    app.get("/managementState/:id", (0, run_1.run)(async (req, resp) => {
        const stateSalaEnsayo = await service.instance.findStateSalaEnsayoById(`id`);
        resp.json(stateSalaEnsayo);
    }));
    app.post("/managementState/", validator.body("name").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const error = validator.validationResult(req);
        if (error && !error.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(error.array());
        }
        const dto = req.body;
        const stateSalaEnsayo = await service.instance.createStateSalaEnsayo({
            name: dto["name"]
        });
        resp.json(stateSalaEnsayo);
    }));
    //Para la parte de tipo de sala de ensayo
    app.get("/managementType/", middleware_1.auth, (0, run_1.run)(async (req, resp) => {
        const type = await service.instance.getAllTypes();
        console.log('ruta type sala: ', type);
        resp.json(type);
    }));
    app.get("/managementType/:id", (0, run_1.run)(async (req, resp) => {
        const type = await service.instance.findTypeById(`id`);
        resp.json(type);
    }));
    app.post("/managementType/", validator.body("name").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const error = validator.validationResult(req);
        if (error && !error.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(error.array());
        }
        const dto = req.body;
        const type = await service.instance.createType({
            name: dto["name"]
        });
        resp.json(type);
    }));
};
exports.route = route;
