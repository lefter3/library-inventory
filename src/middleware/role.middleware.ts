import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { CustomError } from '../utils/errors'; 
import { returnNonSuccess } from '../utils/response';

export const checkRole = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new CustomError('Unauthorized - No user found', 401);
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new CustomError('Forbidden - You do not have permission to access this resource', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};