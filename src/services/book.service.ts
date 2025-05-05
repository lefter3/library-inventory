import { PrismaClient, Books, UserActions, ActionType, Prisma } from '@prisma/client';
import { PaginationParams, SearchBooks } from '../dto/query.dto';
import { CustomError } from '../utils/errors';
import { ActionsFilter } from '../dto/actionFilter.dto';

const prisma = new PrismaClient();

export class BookService {
    /**
   * Searches for books based on a query, with pagination support.
   * If no query is provided, it retrieves all books with pagination.
   * @param payload - The search parameters including query, page, and limit.
   * @returns A promise that resolves to an array of books matching the search criteria.
   */
  async searchBooks(payload: SearchBooks): Promise<Books[]> {
    const { query, page, limit  } = payload;
    const offset = (page - 1) * limit;
    console.log(page,limit, offset, query)
    if (!query) {
      return prisma.books.findMany({
        take: limit,
        skip: offset
      });
    }
    else {
      const string = `%${query.toLowerCase()}%`;
        return prisma.$queryRaw<Books[]>(Prisma.sql`
          SELECT * FROM "Books"
          WHERE 
              LOWER("title") LIKE ${string} OR 
              EXISTS (
              SELECT 1 FROM unnest("authors") AS author 
              WHERE LOWER(author) LIKE ${string}
              ) OR 
              EXISTS (
              SELECT 1 FROM unnest("genres") AS genre 
              WHERE LOWER(genre) LIKE ${string}
              )
          LIMIT ${limit} OFFSET ${offset}
        `);
    }
  }

  /**
   * Retrieves detailed information about a specific book by its ID.
   * 
   * @param bookId - The ID of the book to retrieve.
   * @returns A promise that resolves to the book details.
   * @throws CustomError if the book is not found.
   */
  async getBookDetails(bookId: number): Promise<Books> {
    const book = await prisma.books.findUnique({
      where: { id: bookId }
    });

    if (!book) {
      throw new CustomError("Book not found", 404)
    }
    return book;
  }



  /**
   * Retrieves a list of books that a user has ei5ther bought or borrowed.
   * 
   * @param userId - The ID of the user to filter books for.
   * @returns A promise that resolves to an array of user actions related to the user's books.
   */
  async getBooksByUser(userId: number, pagination:PaginationParams): Promise<Books[]> {
    const { page, limit  } = pagination;
    const offset = (page - 1) * limit;
    return prisma.$queryRaw<Books[]>(Prisma.sql`
      SELECT DISTINCT b.*
      FROM "Books" b
      JOIN "UserActions" ua ON ua."bookId" = b.id
      WHERE ua."userId" = ${userId}
        AND ua."type" IN ('RENT', 'SELL')
      LIMIT ${limit} OFFSET ${offset}
    `);
  }



  /**
   * Retrieves actions performed on a specific book, with optional filters.
   * 
   * @param bookId - The ID of the book to filter actions for.
   * @param filters - Optional filters to narrow down the actions, such as type, userId, or returned status.
   * @returns A promise that resolves to an array of user actions related to the book.
   */
  async getBookActions(
    bookId: number,
    pagination: PaginationParams,
    filters?: ActionsFilter
  ): Promise<UserActions[]> {
    const { page, limit  } = pagination;
    const offset = (page - 1) * limit;
    return prisma.userActions.findMany({
      where: {
        bookId,
        ...(filters?.type && { type: filters.type }),
        ...(filters?.userId && { userId: filters.userId }),
        ...(typeof filters?.returned === 'boolean' && { returned: filters.returned }),
      },
      include: {
        user: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });
  }

}