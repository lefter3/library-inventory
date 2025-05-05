import express, { NextFunction, Request, Response } from "express";
import router from "./routes";
import { CustomError } from "./utils/errors";
import { isAuth } from "./middleware/auth.middleware";
import { reminderEmailsCron } from "./services/reminder.service";

const app = express();

// Body parsing
app.use(express.json());
// Static assets
app.use(express.static("public"));

reminderEmailsCron()
// API Routes
app.use(isAuth)

app.use('/', router);

app.use((err: Error | CustomError, req: Request, res: Response, next: NextFunction) => {
 console.error(err.stack);
 res.status(err instanceof CustomError ? err.statusCode : 500).json({ error: err.message });
});

export default app