import { Books, PrismaClient, Wallet } from '@prisma/client';
import { CustomError } from '../utils/errors';
import { ManagementService } from '../services/management.service';
import env from '../configs/env.config';

const prisma = new PrismaClient();
const managementService = new ManagementService();

/**
 * Service class for managing user interactions with the library inventory system.
 */
export class UserService {

/**
 * Allows a user to borrow a book from the library.
 * Decrements the available copies of the book and records the borrowing action.
 * Updates the wallet balance and creates a wallet movement record.
 * Throws an error if the book is not available or if the operation fails.
 *
 * @param userId - The ID of the user borrowing the book.
 * @param bookId - The ID of the book to be borrowed.
 * @returns A promise that resolves when the transaction is complete.
 * @throws Error if the book is not available or if the operation fails.
 */
  async borrowBook(userId: number, bookId: number): Promise<void> {
    return prisma.$transaction(async (tx) => {
      const book = await tx.books.update({
        where: { id: bookId },
        data: { copies: { decrement: 1 } }
      })
      if (!book || book.copies < 0) {
        throw new Error('Book not available');
      }

      const action = await tx.userActions.create({
        data: {
          type: 'RENT',
          userId,
          bookId,
          returned: false
        }
      })
      const [walletMovement, wallet] = await Promise.all([

        tx.walletMovement.create({
          data: {
            amount: book.sellPrice,
            actionId: action.id,
          }
        }),
        tx.wallet.update({
          where: { id: 1 },
          data: {
            amount: {
              increment: book.sellPrice
            }
          }
        })
      
      ])
      this.checkBookStock(book);
      this.checkWalletBalance(wallet);
    });
  }

    /**
   * Allows a user to return a previously borrowed book.
   * Updates the borrowing record to mark it as returned and increments the available copies of the book.
   * Throws an error if no active borrow record is found for the specified book and user.
   *
   * @param userId - The ID of the user returning the book.
   * @param bookId - The ID of the book to be returned.
   * @returns A promise that resolves with the updated borrowing record.
   * @throws CustomError if no active borrow record is found.
   */
  async returnBook(userId: number, bookId: number) {
    return prisma.$transaction(async (tx) => {
      const borrowedBook = await tx.userActions.updateMany({
        where: {
          userId,
          bookId,
          type: 'RENT',
          returned: false
        },
        data: {
          returned: true,
          returnTime: new Date()
        }
      });

      if (borrowedBook.count === 0) {
        throw new CustomError('No active borrow found for this book', 404);
      }

      await tx.books.update({
        where: { id: bookId },
        data: { copies: { increment: 1 } }
      });
    });
  }

  /**
   * Allows a user to buy a book from the library.
   * Decrements the available copies of the book and records the selling action.
   * Updates the wallet balance and creates a wallet movement record.
   * Throws an error if the book is not available or if the operation fails.
   *
   * @param userId - The ID of the user buying the book.
   * @param bookId - The ID of the book to be bought.
   * @returns A promise that resolves with the transaction result.
   * @throws CustomError if the book is not available or if the operation fails.
   */
  async buyBook(userId: number, bookId: number) {
    return prisma.$transaction(async (tx) => {
      const book = await tx.books.update({
        where: { id: bookId },
        data: {
          copies: { decrement: 1 }
        }
      });
      if (!book || book.copies <= 0) {
        throw new CustomError('Book not a vailable', 404);
      }
      const action = await tx.userActions.create({
        data: {
          type: 'SELL',
          userId,
          bookId,
        }
      });
      const [walletMovement, wallet] = await Promise.all([
        tx.walletMovement.create({
          data: {
            amount: book.sellPrice,
            actionId: action.id,
          }
        }),
        tx.wallet.update({
          where: { id: 1 },
          data: {
            amount: {
              increment: book.sellPrice
            }
          }
        })
      ]);
      this.checkBookStock(book);
      this.checkWalletBalance(wallet);
    });
  }
  /**
   * Checks the wallet balance and sends a congratulation email if the balance exceeds a certain amount.
   * @param wallet - The user's wallet object.
   */
  private checkWalletBalance(wallet: Wallet) {
    if (wallet.amount >= env.congratulationAmount && !wallet.congratulationEmailSent) {
      managementService.congratulateManagement()
        .catch((error) => {
          console.error('Error sending congratulation email:', error);
        });
      }
  }

  /**
   * Checks the stock of a book and triggers a restock if the available copies are low.
   * @param book - The book object to check.
   */
  private checkBookStock(book: Books){
    if (book.copies === 1) {
      managementService.restockBook(book.id).catch((error) => {
        console.error('Error restocking book:', error);
      });
  }
  }
}