import { Email } from "../dto/email.dto";
import env from "../configs/env.config";

export class EmailService {


    async sendEmail(payload: Email): Promise<boolean> {
        console.log("Sending email to: ", payload.to);
        console.log("From: ", env.emailFrom);
        console.log("Subject: ", payload.subject);
        console.log("Body: ", payload.message);
        return Promise.resolve(true);
    }


    async sendReminderEmail(bookTitle:string, to: string){
        const payload: Email = {
            to,
            subject: "Return Reminder",
            message: `This is a reminder email for book ${bookTitle} to be returned.`
        }
        return this.sendEmail(payload); 
    }

    async sendRestockEmail(bookId: number, to: string){
        const payload: Email = {
            to,
            subject: "Reminder",
            message: `This is a reminder email to restock book(id=${bookId}).`
        }
        return this.sendEmail(payload);
    }

    async sendCongratulationEmail(to: string){
        const payload: Email = {
            to,
            subject: "Congratulation",
            message: "This is a reminder email."
        }
        return this.sendEmail(payload); 
    }
}