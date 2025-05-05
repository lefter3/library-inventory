import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { borrowBookMiddleware } from '../middleware/borrowBook.middleware';
import { buyBookMiddleware } from '../middleware/buyBook.middleware';

const router = Router();
const userController = new UserController();

// User routes
router.get(
  '/:bookId/borrow',
  borrowBookMiddleware(),
  userController.borrowBook
);

router.get(
  '/:bookId/buy',
  buyBookMiddleware(),
  userController.buyBook
)

router.get(
  '/:bookId/return',
  userController.returnBook
);

export default router;