
/**
 *  Registra todas las rutas de nuestra aplicación. Debe usarse linkeando al archivo "routes" dentro de cada 
 *  módulo.
 *  @param {Express} app
 */
 import { AuthenticationException, ArgumentsException  } from "../common/exception/exception.js"
 import * as express from "express"
 import { run } from "../common/utils/run"
 
 import * as location from "../location/routes.js"
 import * as users from "../users/routes.js"
 import * as perfil from "../perfil/routes"
 import * as configuracion from "../configuracion/routes"
 import * as comodidad from "../comodidad/routes"
 import * as artista from "../artista/routes"
 import * as sala_de_ensayo from "../sala_de_ensayo/routes"
 import * as management_sala_de_ensayo from "../management_sala_de_ensayo/routes"
 import * as comision from "../comision/routes"
 import * as email from "../mail/routes"
 import * as imagen from "../imagen/routes"
 import * as reservation from "../reservation/routes"
 import * as pago from "../pago/routes"
 
export const  route = (app : express.Application) => {

    app.get("/", async (req, resp) => {
        console.log("Got a request")
        console.log("req")
        console.log(req)
        resp.send("Hello world")
    })
    users.route(app)
    comodidad.route(app)
    configuracion.route(app)
    perfil.route(app)
    sala_de_ensayo.route(app)
    location.route(app)
    artista.route(app)
    management_sala_de_ensayo.route(app)
    comision.route(app)
    email.route(app)
    imagen.route(app)
    reservation.route(app)
    pago.route(app)

}