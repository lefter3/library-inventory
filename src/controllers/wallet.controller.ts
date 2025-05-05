import { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { returnSuccess } from '../utils/response';
import { paginationSchema } from '../dto/query.dto';

const prisma = new PrismaClient();
export class WalletController {
    getWalletInfo = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const pagination = paginationSchema.validate(req.query);
            const { page, limit  } = pagination.value;
            const offset = (page - 1) * limit;
            const [wallet, movements] = await Promise.all([
                prisma.wallet.findFirst({
                    orderBy: { id: 'desc' }
                }),
                prisma.walletMovement.findMany({
                    orderBy: {
                        id: 'desc'
                    },
                    include: {
                        action: true
                    },
                    take: limit,
                    skip: offset
                })
            ]);
            if (!wallet) {
                throw new Error('Wallet not found');
            }
            returnSuccess(req, res, 200, 'Wallet found', { balance: wallet.amount, movements })
        } catch (error) {
            next(error);
          }
    }
}
