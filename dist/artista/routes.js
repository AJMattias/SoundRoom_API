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
    /**
     *  Listamos todos los usuarios en el backend.  Esto es solo a fines de la demo
     *  Ademas nos servira para el desarrollo de los otros tickets.
     */
    app.get("/artistStyle/", (0, run_1.run)(async (req, resp) => {
        //NOTA: tengan cuidado de no olvidar el await. Si omitimos el await
        // la respuesta de backend ser�a un objeto Promise sin resolver que�
        // se serializa como {}
        const artistStyles = await service.instance.getAllArtistStyles();
        resp.json(artistStyles);
    }));
    app.get("/artistType/", (0, run_1.run)(async (req, resp) => {
        //NOTA: tengan cuidado de no olvidar el await. Si omitimos el await
        // la respuesta de backend ser�a un objeto Promise sin resolver que�
        // se serializa como {}
        const artistType = await service.instance.getAllArtistTypes();
        resp.json(artistType);
    }));
    app.post("/artistType/", validator.body("nameArtistType").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const dto = req.body;
        const artistType = await service.instance.createArtistType({
            nameArtistType: dto["nameArtistType"]
        });
        resp.json(artistType);
    }));
    app.post("/artiststyle/", validator.body("nameArtistStyle").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), validator.body("idArtistType").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const dto = req.body;
        const artistStyle = await service.instance.createArtistStyle({
            nameArtistStyle: dto["nameArtistStyle"],
            idArtistType: dto["idArtistType"]
        });
        resp.json(artistStyle);
    }));
};
exports.route = route;
