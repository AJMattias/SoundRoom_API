"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordTokens = void 0;
class PasswordTokens {
    constructor() {
        this.tokens = {};
    }
    createToken(email) {
        let token = "";
        for (let i = 0; i < 6; i++) {
            token += `${Math.round(Math.random() * 10)}`;
        }
        this.tokens[email] = token;
        return token;
    }
    checkToken(email, token) {
        return this.tokens[email] == token;
    }
}
exports.passwordTokens = new PasswordTokens();
