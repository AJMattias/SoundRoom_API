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
const validator = __importStar(require("express-validator"));
const constants_1 = require("../common/utils/constants");
const validator_utils_1 = require("../common/utils/validator_utils");
const model_1 = require("./model");
const route = (app) => {
    app.post("/pago/create/", middleware_1.auth, 
    //validator.body("idUser").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    validator.body("idSala").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("idReservation").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("name").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("ccv").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("numeroTarjeta").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("fechaVencimiento").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const dto = req.body;
        const idUser = req.user.id;
        //const email = req.user.email
        console.log('route dto receive: ', dto);
        const pagoCreated = await model_1.PagoModel.create({
            idUser: idUser,
            idSala: dto["idSala"],
            idReservation: dto["idReservation"],
            name: dto["name"],
            ccv: dto["ccv"],
            numeroTarjeta: dto["numeroTarjeta"],
            fechaVencimiento: dto["fechaVencimiento"],
            createdAt: new Date()
        });
        resp.json(pagoCreated);
    }));
};
exports.route = route;
