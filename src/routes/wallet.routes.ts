import { Router } from 'express';
import { WalletController } from '../controllers/wallet.controller';
import { checkRole } from '../middleware/role.middleware';

const router = Router();
const walletController = new WalletController();

router.get(
  '/info',
  checkRole(['ADMIN']),
  walletController.getWalletInfo
);

export default router;