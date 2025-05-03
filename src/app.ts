import express, { NextFunction, Request, Response } from "express";
import router from "./routes";

const app = express();

// Body parsing
app.use(express.json());
// Static assets
app.use(express.static("public"));
// API Routes

app.use('/', router);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
 console.log(err.stack);
 res.status(500).json({ error: "Internal Server Error" });
});

export default app