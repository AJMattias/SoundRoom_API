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
const middleware_1 = require("../server/middleware");
const constants_1 = require("../common/utils/constants");
const validator_utils_1 = require("../common/utils/validator_utils");
const model_1 = require("./model");
const route = (app) => {
    app.get("/comisiones/", middleware_1.auth, middleware_1.admin, (0, run_1.run)(async (req, resp) => {
        const comisiones = await service.instance.getAllComisiones();
        resp.json(comisiones);
    }));
    app.get("/comision/", validator.query("id").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const id = req.params.id;
        const comision = await service.instance.findComisionById(id);
        resp.json(comision);
    }));
    app.post("/comision/", middleware_1.auth, middleware_1.admin, validator.body("porcentaje").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const dto = req.body;
        //checkif porcentaje already exists
        const exists = await model_1.ComisionModel.exists({ porcentaje: dto["porcentaje"] });
        if (exists) {
            console.log('!exists: ', exists);
            resp.json({ msg: "comision ya existe", error: "Entity already exists" });
        }
        try {
            const comision = await service.instance.createComision({
                porcentaje: dto["porcentaje"]
            });
            resp.json(comision);
        }
        catch (error) {
            resp.status(500).json(error);
        }
    }));
    app.get("/comision/getEnabled/", (0, run_1.run)(async (req, resp) => {
        const comision = await service.instance.findEnabled();
        console.log(comision);
        resp.json(comision);
    }));
    app.put("/comision/actualizarComision/", middleware_1.auth, middleware_1.admin, validator.query("id").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), 
    //validator.body("porcentaje").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const id = req.query.id;
        //const dto = req.body
        // const original : ComisionDto = await service.instance.findEnabled()
        // if(!dto["porcentaje"]){
        //     dto["porcentaje"] = original["porcentaje"]
        // }
        // if(!dto["createdAt"]){
        //     dto["createdAt"] = original["createdAt"]
        // }
        const comision = await service.instance.updateComisionEnabled(id
        //, {
        //porcentaje: dto["porcentaje"],
        //createdAt: dto["createdAt"]}
        );
        console.log('route response: ', comision);
        resp.json(comision);
    }));
    app.put("/comision/deleteComision/", middleware_1.auth, middleware_1.admin, validator.query("id").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const id = req.query.id;
        const comision = await service.instance.deleteComision(id);
        resp.json(comision);
    }));
    app.put("/comision/softDelete/", middleware_1.auth, middleware_1.admin, validator.query("id").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), 
    //validator.body("porcentaje").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const id = req.query.id;
        const comisionToDelete = await service.instance.findComisionById(id);
        const comision = await service.instance.softDeleteComision(id, {
            porcentaje: comisionToDelete.porcentaje,
            createdAt: comisionToDelete.createdAt
        });
        console.log('route response: ', comision);
        resp.json(comision);
    }));
};
exports.route = route;
