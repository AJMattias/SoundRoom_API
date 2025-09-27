"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailService = void 0;
const MailCtrl_1 = require("../server/MailCtrl");
class MailService {
    async sendMessage(to, body) {
        return await (0, MailCtrl_1.sendEmailAsync)({
            to: to,
            subject: 'Notificación de SoundRoom',
            text: body
        });
    }
}
exports.mailService = new MailService();
