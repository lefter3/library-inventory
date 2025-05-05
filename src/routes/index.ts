import { Router, Request, Response } from 'express';
import bookRoutes from './book.routes';
import walletRoutes from './wallet.routes';
import userRoutes from './user.routes';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

router.get("/", (req, res) => {
  res.send("Express Server");
});

router.use('/books', bookRoutes);
router.use('/wallet', walletRoutes);
router.use('/user', userRoutes);

export default router;
