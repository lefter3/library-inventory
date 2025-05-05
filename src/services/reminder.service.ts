import cron from 'node-cron';
import { PrismaClient, UserActions } from '@prisma/client';
import { EmailService } from './mail.service'; 

const prisma = new PrismaClient();
const emailService = new EmailService();


/**
 * Schedules a cron job to send reminder emails for overdue book rentals.
 * The job runs every hour and checks for overdue actions that are 3 days old.
 * If an overdue action is found, a reminder email is sent to the user.
 */
export async function reminderEmailsCron() {
    cron.schedule('0 * * * *', async () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const overdueActions = await prisma.userActions.findMany({
        where: {
            returned: false,
            reminderSent: false,
            type: 'RENT',
            createdAt: {
                lt: threeDaysAgo
            }
        },
        include: {
            user: true,
            book: true
        }
    });

    for (const action of overdueActions) {
        const result = await emailService.sendReminderEmail(action.book.title, action.user.email);
        if (result) {
            console.log(`Reminder email sent to ${action.user.email} for book ${action.book.title}`);
            prisma.userActions.update({
                where: { id: action.id },
                data: { reminderSent: true }
            }).catch((error) => {
                console.error('Error updating user action:', error);
            });
        } else {
            console.error(`Failed to send reminder email to ${action.user.email} for book ${action.book.title}`);
        }

    }
    })
}