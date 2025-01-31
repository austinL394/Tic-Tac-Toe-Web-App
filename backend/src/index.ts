import { AppDataSource } from "./data-source";
import * as express from "express";
import * as dotenv from "dotenv";
import { Request, Response } from "express";
import { userRouter } from "./routes/user.routes";
import { errorHandler } from "./middleware/error-middleware";
import "reflect-metadata";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", userRouter);

// 404 handler - should come before error handler
app.get("*", (req: Request, res: Response) => {
  res.status(404).json({ message: "Not Found" }); // Changed from 505 to 404 for proper HTTP status
});

// Error handler should be last middleware
app.use(errorHandler);

// Database connection and server start
AppDataSource.initialize()
  .then(async () => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
    console.log("Data Source has been initialized!");
  })
  .catch((error) => {
    console.error("Error during Data Source initialization:", error);
    process.exit(1); // Exit process with failure
  });

const PORT = process.env.PORT || 3000; // Moved PORT definition before usage
