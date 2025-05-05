import { Request, Response } from 'express';

export function returnSuccess<T>(
  req: Request,
  res: Response,
  statusCode: number,
  message: string,
  data: T
) {
  const returnResponse = {
    status: 'OK',
    message,
    data,
  };
  return res.status(statusCode).json(returnResponse);
}

export function returnNonSuccess(
  req: Request,
  res: Response,
  statusCode: number,
  message: string
) {
  return res.status(statusCode).json({ status: 'ERROR', message });
}
