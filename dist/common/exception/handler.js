"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exception_1 = require("./exception");
/***
 *  Manejo de excepciones  de nuestra app.
 *  Este middleware va a interceptar las excepciones de negocio que larguemos en cada request
 *
 * @param {Express} app
 */
const handle = (app) => {
    app.use(function (err, req, res, next) {
        console.log("Got error! ");
        if (err instanceof exception_1.BaseException) {
            err.send(res);
        }
        else {
            const mapped = mapMongoError(err);
            if (mapped && mapped instanceof exception_1.BaseException) {
                mapped.send(res);
                return;
            }
            console.error("Uncaught error!");
            console.error(err);
            const serverError = new exception_1.ServerException();
            serverError.send(res);
        }
    });
};
exports.handle = handle;
const mapMongoError = (mongoError) => {
    console.error("MongoError got!!");
    console.error(mongoError);
    if (mongoError.message.indexOf("duplicate key error") !== -1) {
        return new exception_1.DuplicatedKeyException();
    }
    else if (mongoError instanceof exception_1.ModelNotFoundException) {
        return mongoError;
    }
    else if (mongoError.message.indexOf("Cast to ObjectId failed") !== -1) {
        return new exception_1.ModelNotFoundException();
    }
    else {
        return undefined;
    }
};
