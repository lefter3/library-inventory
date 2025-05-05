import { Request, Response, NextFunction } from 'express';
import { BookService } from '../services/book.service';
import { returnSuccess } from '../utils/response';
import { CustomError } from '../utils/errors';
import { paginationSchema, searchSchema } from '../dto/query.dto';
import { actionsFilterSchema } from '../dto/actionFilter.dto';

export class BookController {

  private bookService = new BookService();

  searchBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const  { value: query }  = searchSchema.validate(req.query)
      const books = await this.bookService.searchBooks(query);
      returnSuccess(req, res, 200, 'Books found', books);
    } catch (error) {
      next(error);
    }
  }

  getBookDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bookId = parseInt(req.params.id);
      const book = await this.bookService.getBookDetails(bookId);
      
      returnSuccess(req,res, 200, "Book found", book)      
    } catch (error) {
      next(error);
    }
  }

  getBookActions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bookId = parseInt(req.params.id);
      const { value: filters, error: filtersError } = actionsFilterSchema.validate(req.body);
      if (filtersError) {
        next(new CustomError(filtersError.details.toString(), 400));
      }
      const pagination = paginationSchema.validate(req.query);
      
      const actions = await this.bookService.getBookActions(bookId, pagination.value, filters);
      
      returnSuccess(req, res, 200, 'Book actions found', actions);
    } catch (error) {
      next(error);
    }
  }

  getBooksByUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      const pagination = paginationSchema.validate(req.query);
      const books = await this.bookService.getBooksByUser(parseInt(userId), pagination.value);
      returnSuccess(req, res, 200, 'Books found', books);
    } catch (error) {
      next(error);
    }
  }

}