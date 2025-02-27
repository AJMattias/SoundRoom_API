import { sendEmailAsync } from "../server/MailCtrl";

class MailService {
    async sendMessage(to: string, body: string): Promise<void> {
        return await sendEmailAsync(
            {
                to: to,
                subject: 'Notificación de SoundRoom',
                text: body
            }
        )
    }
}

export const mailService = new MailService()