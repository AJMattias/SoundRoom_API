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
exports.routes = void 0;
const location = __importStar(require("../location/routes.js"));
const users = __importStar(require("../users/routes.js"));
const perfil = __importStar(require("../perfil/routes"));
const configuracion = __importStar(require("../configuracion/routes"));
const comodidad = __importStar(require("../comodidad/routes"));
const artista = __importStar(require("../artista/routes"));
const sala_de_ensayo = __importStar(require("../sala_de_ensayo/routes"));
const management_sala_de_ensayo = __importStar(require("../management_sala_de_ensayo/routes"));
const comision = __importStar(require("../comision/routes"));
const email = __importStar(require("../mail/routes"));
const reservation = __importStar(require("../reservation/routes"));
const pago = __importStar(require("../pago/routes"));
const routes = (app) => {
    app.get("/", async (req, resp) => {
        console.log("Got a request");
        console.log("req");
        console.log(req);
        resp.send("Hello world");
    });
    //app.options("/auth", cors());
    app.get("/", async (req, resp) => {
        resp.json({
            message: "API is working!",
            testAuth: "Use POST /auth with email and password",
            timestamp: new Date().toISOString()
        });
    });
    app.post('/auth-test', (req, res) => {
        console.log('✅ TEST /auth-test received');
        res.json({
            message: 'Auth test endpoint working!',
            body: req.body,
            timestamp: new Date().toISOString()
        });
    });
    users.route(app);
    comodidad.route(app);
    configuracion.route(app);
    perfil.route(app);
    sala_de_ensayo.route(app);
    location.route(app);
    artista.route(app);
    management_sala_de_ensayo.route(app);
    comision.route(app);
    email.route(app);
    //imagen.route(app)
    reservation.route(app);
    pago.route(app);
};
exports.routes = routes;
