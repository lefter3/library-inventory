import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { returnSuccess } from '../utils/response';

export class UserController {
  private userService = new UserService();

  borrowBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const bookId = parseInt(req.params.bookId);
      
      const result = await this.userService.borrowBook(userId, bookId);
      returnSuccess(req, res, 201, 'Book borrowed successfully', result);
    } catch (error) {
      next(error);
    }
  }

  returnBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const bookId = parseInt(req.params.bookId);
      
      const result = await this.userService.returnBook(userId, bookId);
      returnSuccess(req, res, 200, 'Book returned successfully', {});
    } catch (error) {
      next(error);
    }
  }

  buyBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const bookId = parseInt(req.params.bookId);
      const result = await this.userService.buyBook(userId, bookId);
      returnSuccess(req, res, 201, 'Book purchased successfully', result);
    } catch (error) {
      next(error);
    }
  }
}