import { Router, Request, Response } from 'express';
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

export default router;
