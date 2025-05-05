import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/errors";

const prisma = new PrismaClient();

export function buyBookMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id;
        const bookId = parseInt(req.params.bookId)
        const [ book , copiesBuyed, totalBuyed ] = await Promise.all([
            prisma.books.findUnique({
                where: {
                    id: bookId
                },
                select: {
                    copies: true
                }
            }),
            prisma.userActions.count({
                where: {
                  userId,
                  type: 'SELL',
                  bookId
                }
            }),
            prisma.userActions.count({
                where: {
                  userId,
                  type: 'SELL'
                }
            })
        ]);

        if (!book || book.copies <= 0) {
            throw new CustomError("Book not available", 404);
        }
        if (copiesBuyed >= 2) {
            throw new CustomError("You can only buy 2 books", 403);
        }
        if (totalBuyed >= 10) {
            throw new CustomError("You can only buy 10 books", 403);
        }
        next();
    } catch (err) {
      next(err);
    }
  };
}
