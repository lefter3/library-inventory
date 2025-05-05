import { borrowBookMiddleware } from "../../../src/middleware/borrowBook.middleware";
import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../../src/utils/errors";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("@prisma/client");

const prismaMock = {
    books: {
        findUnique: jest.fn()
    },
    userActions: {
        findFirst: jest.fn(),
        count: jest.fn()
    }
} as unknown as jest.Mocked<PrismaClient>;

describe("borrowBookMiddleware", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            user: {
                id: 1,
                createdAt: new Date(),
                email: "",
                role: "USER"
            },
            params: { bookId: "1" },
        };
        res = {};
        next = jest.fn();
        jest.clearAllMocks();
    });

    it("should call next if all conditions are met", async () => {
        prismaMock.books.findUnique.mockResolvedValue({
            copies: 1,
            id: 0,
            title: "",
            authors: [],
            genres: [],
            stockSize: 0,
            stockPrice: 0,
            sellPrice: 0,
            borrowPrice: 0
        });
        prismaMock.userActions.findFirst.mockResolvedValue(null);
        prismaMock.userActions.count.mockResolvedValue(2);

       await middleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith();
    });

    it("should throw 'Book not available' if book does not exist or no copies are available", async () => {
        prismaMock.books.findUnique.mockResolvedValue(null);

        const middleware = borrowBookMiddleware();
        await middleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(new CustomError("Book not available", 404));
    });

    it("should throw 'User has borrowed the book' if user already borrowed the book", async () => {
        prismaMock.books.findUnique.mockResolvedValue({
            copies: 1,
            id: 0,
            title: "",
            authors: [],
            genres: [],
            stockSize: 0,
            stockPrice: 0,
            sellPrice: 0,
            borrowPrice: 0
        });
        prismaMock.userActions.findFirst.mockResolvedValue({ id: 1 } as any);

        const middleware = borrowBookMiddleware();
        await middleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(new CustomError("User has borrowed the book", 403));
    });

    it("should throw 'You can only borrow 3 books' if user has already borrowed 3 books", async () => {
        prismaMock.books.findUnique.mockResolvedValue({
            copies: 1,
            id: 0,
            title: "",
            authors: [],
            genres: [],
            stockSize: 0,
            stockPrice: 0,
            sellPrice: 0,
            borrowPrice: 0
        });
        prismaMock.userActions.findFirst.mockResolvedValue(null);
        prismaMock.userActions.count.mockResolvedValue(3);

        const middleware = borrowBookMiddleware();
        await middleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(new CustomError("You can only borrow 3 books", 403));
    });

    it("should pass errors to next if an unexpected error occurs", async () => {
        const error = new Error("Unexpected error");
        prismaMock.books.findUnique.mockRejectedValue(error);

        const middleware = borrowBookMiddleware();
        await middleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});