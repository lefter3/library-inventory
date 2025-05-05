import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/errors";

const prisma = new PrismaClient();

export function borrowBookMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id;
        const bookId = parseInt(req.params.bookId)

        const [book, existingBorrow, activeBorrow ] = await Promise.all([
          prisma.books.findUnique({
            where: {
                id: bookId
            },
            select: {
                copies: true
            }
        }),
            prisma.userActions.findFirst({
              where: {
                userId,
                bookId,
                type: 'RENT',
                returned: false
              }
            }),
            prisma.userActions.count({
                where: {
                  userId,
                  type: 'RENT',
                  returned: false
                }
            })
        ]);        

        if (!book || book.copies <= 0) {
          throw new CustomError("Book not available", 404);
        }
        if (existingBorrow) {
            throw new CustomError("User has borrowed the book", 403);
        }
        if (activeBorrow >= 3) {
            throw new CustomError("You can only borrow 3 books", 403);
        }
        next();
    } catch (err) {
      next(err);
    }
  };
}
