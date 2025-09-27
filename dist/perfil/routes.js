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
const middleware_2 = require("../server/middleware");
// import { PermisoDoc } from "./modelPermiso";
/**
*
* @param {Express} app
*/
const route = (app) => {
    app.get("/perfiles/", (0, run_1.run)(async (req, resp) => {
        const perfiles = await service.instance.getAllPerfiles();
        console.log(perfiles);
        resp.json(perfiles);
    }));
    app.get("/permisos/", middleware_1.auth, middleware_2.admin, (0, run_1.run)(async (req, resp) => {
        const permisos = await service.instance.getAllPermisos();
        resp.json(permisos);
    }));
    app.get("/permisosDisabled/", middleware_1.auth, middleware_2.admin, (0, run_1.run)(async (req, resp) => {
        const permisos = await service.instance.getAllPermisosDisabled();
        resp.json(permisos);
    }));
    app.get("/perfil/", middleware_1.auth, (0, run_1.run)(async (req, resp) => {
        const id = req.query.id;
        console.log(id);
        const perfil = await service.instance.findPerfilById(id);
        resp.json(perfil);
    }));
    app.get("/permiso/findPermisoById/", middleware_1.auth, middleware_2.admin, (0, run_1.run)(async (req, resp) => {
        const id = req.query.id;
        const permiso = await service.instance.findPermisoById(id);
        resp.json(permiso);
    }));
    app.post("/perfiles/", middleware_1.auth, middleware_2.admin, validator.body("name").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const error = validator.validationResult(req);
        if (error && !error.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(error.array());
        }
        const dto = req.body;
        const perfil = await service.instance.createPerfil({
            name: dto["name"]
        });
        resp.json(perfil);
    }));
    app.post("/permisos/", middleware_1.auth, middleware_2.admin, validator.body("name").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), 
    // validator.body("idPerfil").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const dto = req.body;
        const permiso = await service.instance.createPermiso({
            name: dto["name"],
            enabled: dto["enabled"]
        });
        resp.json(permiso);
    }));
    app.put("/permiso/", middleware_1.auth, middleware_2.admin, validator.query("id").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const dto = req.body;
        const id = req.query.id;
        const permisoOriginal = await service.instance.findPermisoById(id);
        if (!dto["name"]) {
            dto["name"] = permisoOriginal["name"];
        }
        if (!dto["enabled"]) {
            dto["enabled"] = permisoOriginal["enabled"];
        }
        const permiso = await service.instance.updatePermiso(id, {
            name: dto["name"],
            enabled: dto["enabled"]
        });
        resp.json(permiso);
    }));
    app.put("/perfil/update/", middleware_1.auth, middleware_2.admin, validator.query("id").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const dto = req.body;
        const id = req.query.id;
        const perfilOriginal = await service.instance.findPerfilById(id);
        if (!dto["name"]) {
            dto["name"] = perfilOriginal["name"];
        }
        const perfil = await service.instance.updatePerfil(id, {
            name: dto["name"],
            permisos: dto["permisos"]
        });
        resp.json(perfil);
    }));
    // app.put("/perfil/addPermisoToPerfil/",
    //     auth, admin,
    //     validator.query("id").notEmpty().withMessage(ErrorCode.FIELD_REQUIRED),
    //     run( async( req: Request, resp: Response) => {
    //         const errors = validator.validationResult(req)
    //             if(errors && !errors.isEmpty()){
    //                 throw ValidatorUtils.toArgumentsException(errors.array())
    //             }
    //         const permisos: string[] = req.body.permisos
    //         const id = req.query.id as string
    //         const perfilOriginal : PerfilDto = await service.instance.findPerfilById(id)
    //             // if(!dto["name"]){
    //             //     dto["name"] = perfilOriginal["name"];
    //             // }
    //         const perfil = await service.instance.addPermisoToPerfil(id,
    //             //name: dto["name"],
    //             permisos
    //         )
    //         resp.json(perfil)
    //     })
    // )
    app.put("/perfil/addPermisoToPerfil/", middleware_1.auth, middleware_2.admin, validator.query("id").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const permisos = req.body.permisos;
        console.log('ruta perfil, permisos: ', permisos);
        const id = req.query.id;
        const perfilOriginal = await service.instance.findPerfilById(id);
        const perfil = await service.instance.addPermisoToPerfil(id, permisos); // Llamada al servicio correcto
        resp.json(perfil);
    }));
    app.put("/perfil/deletePermisoFromPerfil/", middleware_1.auth, middleware_2.admin, validator.query("id").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const dto = req.body;
        const id = req.query.id;
        const perfilOriginal = await service.instance.findPerfilById(id);
        if (!dto["name"]) {
            dto["name"] = perfilOriginal["name"];
        }
        const perfil = await service.instance.deletePermisoFromPerfil(id, {
            name: dto["name"],
            permisos: dto["permisos"]
        });
        resp.json(perfil);
    }));
    app.put("/permiso/deletePerfil/", validator.query("id").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        const id = req.query.id;
        console.log(id);
        const perfil = await service.instance.deletePerfil(id);
        resp.json(perfil);
    }));
    app.put("/permiso/deletePermiso/", validator.query("id").notEmpty().withMessage(constants_1.ErrorCode.FIELD_REQUIRED), (0, run_1.run)(async (req, resp) => {
        const errors = validator.validationResult(req);
        if (errors && !errors.isEmpty()) {
            throw validator_utils_1.ValidatorUtils.toArgumentsException(errors.array());
        }
        //const dto = req.body
        const id = req.query.id;
        console.log(id);
        // const permisoOriginal : PermisoDto = await service.instance.findPermisoById(id)
        //     if(!dto["name"]){
        //         dto["name"] = permisoOriginal["name"];
        //     }
        //     if(!dto["enabled"]){
        //         dto["enabled"] = permisoOriginal["enabled"];
        //     }
        const perfil = await service.instance.deletePermiso(id);
        //     , {
        //     name: dto["name"],
        //     enabled:dto["enabled"],
        // }
        resp.json(perfil);
    }));
};
exports.route = route;
