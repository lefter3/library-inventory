import { Router } from 'express';
import { BookController } from '../controllers/book.controller';
import { UserController } from '../controllers/user.controller';
import { checkRole } from '../middleware/role.middleware';
import { borrowBookMiddleware } from '../middleware/borrowBook.middleware';

const router = Router();
const bookController = new BookController();
const userController = new UserController();

// Admin routes
router.get(
  '/search',
  checkRole(['ADMIN']),
  bookController.searchBooks
);

router.get(
  '/:id',
  checkRole(['ADMIN']),
  bookController.getBookDetails
);

router.post(
  '/:id/actions',
  checkRole(['ADMIN']),
  bookController.getBookActions
);

router.get(
  '/user/:id',
  checkRole(['ADMIN']),
  bookController.getBooksByUser
)

export default router;