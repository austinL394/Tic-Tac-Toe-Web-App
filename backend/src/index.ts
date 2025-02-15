import * as express from "express";
import { Request, Response } from "express";
import * as cors from "cors";

import { Server } from "socket.io";
import * as dotenv from "dotenv";

import { AppDataSource } from "./data-source";
import { userRouter } from "./routes/user.routes";

import { errorHandler } from "./middleware/error-middleware";

import SocketService from "./socketio/socketServer";

dotenv.config();
const PORT = process.env.PORT || 3000; // Moved PORT definition before usage

// Database connection and server start
AppDataSource.initialize()
  .then(async () => {
    const app = require("express")();
    const http = require("http").Server(app);
    const io = new Server(http, {
      cors: {
        origin: "*", // Allow all origins temporarily
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Authorization", "Content-Type"],
      },
    });

    new SocketService(io);

    http.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    // Enable CORS for all routes
    app.use(
      cors({
        origin: true, // Allow all origins temporarily for testing
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        exposedHeaders: ["set-cookie"],
      })
    );

    // Routes
    app.use("/api/auth", userRouter);

    // 404 handler - should come before error handler
    app.get("*", (req: Request, res: Response) => {
      res.status(404).json({ message: "Not Found" }); // Changed from 505 to 404 for proper HTTP status
    });

    // Error handler should be last middleware
    app.use(errorHandler);

    console.log("Data Source has been initialized!");
  })
  .catch((error) => {
    console.error("Error during Data Source initialization:", error);
    process.exit(1); // Exit process with failure
  });
