import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { CustomError } from '../utils/errors';
import env from '../configs/env.config';

const prisma = new PrismaClient();

export const isAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = req.headers[env.authHeader] as string;

    if (!email) {
      throw new CustomError('Unauthorized - No email provided', 401);
    }

    const user = await prisma.users.findUnique({
      where: { email }
    });

    if (user) {
      req.user = user;
    } else {
      throw new CustomError('User not found', 401);
    }
    next();
  } catch (error) {
    next(error);
  }
};