import { PrismaClient, Role, Users } from "@prisma/client";
import { EmailService } from "./mail.service";
import * as cron from 'node-cron';
import { mock } from "node:test";


const emailService = new EmailService();
const prisma = new PrismaClient();

export class ManagementService {
    /**
     * Retrieves the management user from the database.
     * @returns The management user.
     * @throws Error if the management user is not found.
     */
    private async getManagementUser(): Promise<Users> {
        const user =await prisma.users.findFirst({
            where: {
                role: Role.MANAGEMENT
            }
        });
        if (!user) {
            throw new Error("Management user not found");
        } 
        return user;
    }

    /**
     * Schedules a task to run after 1 hour.
     * @param taskFunction - The restock function to execute after 1 hour.
     */
    private mockRestock(taskFunction: () => void) {
        // Schedule task to run after 1 hour
        const job = cron.schedule('0 * * * *', () => {
            taskFunction();
            // Stop the cron job after it runs once
            job.stop();
        }, {
            scheduled: true,
            timezone: "UTC"
        });

        // Start the job
        job.start();
    }

    /**
     * Sends a restock email to the management user and schedules a task to restock the book.
     * @param bookId - The ID of the book to restock.
     */
    async askForRestock(bookId: number){
        const user = await this.getManagementUser();
        const result = await emailService.sendRestockEmail(bookId, user.email);
        if (result) {
            this.mockRestock(() => {
                this.restockBook(bookId);
            });
        }
        
    }

    /**
     * Restocks a book by updating its copies and creating a wallet movement.
     * @param bookId - The ID of the book to restock.
     * @throws Error if the book is not found or if there are insufficient funds.
     */
    async restockBook(bookId: number): Promise<void>{
        const user = await this.getManagementUser();
        const userId = user.id;
        const book = await prisma.books.findUnique({
            where: { id: bookId },
        });
        if (!book) {
            throw new Error("Book not found");
        }
        if (book.copies >= book.stockSize) {
            console.log("Book is already in stock");
            return
        }
        const copiesToRestock = book.stockSize - book.copies;
        const restockPrice = book.stockPrice * copiesToRestock;

        prisma.$transaction(async (tx) => {
            const action = await tx.userActions.create({
                data: {
                  type: 'RESTOCK',
                  userId,
                  bookId,
                }
              });
            const [ updatedBook, walletMovement, wallet ] = await Promise.all([
                prisma.books.update({
                    where: { id: bookId },
                    data: { copies: book.stockSize },
                }),
                tx.walletMovement.create({
                    data: {
                      amount: restockPrice,
                      actionId: action.id,
                    }
                }),
                tx.wallet.update({
                    where: { id: 1 },
                    data: {
                        amount: {
                        decrement:restockPrice
                        }
                    }
                })
            ])
            if (wallet.amount < 0) {
                throw new Error(`Insufficient wallet balance for restocking book(id=${bookId})`);
            }
        });

    }

    /**
     * Sends a congratulation email to the management user.
     * @throws Error if the management user is not found.
     */
    async congratulateManagement(): Promise<void> {
        const user = await this.getManagementUser();
        const result = await emailService.sendCongratulationEmail(user.email);
        if (result) {
            prisma.wallet.update({
                where: { id: 1 },
                data: {
                    congratulationEmailSent: true
                }
            });
        }
    }
}