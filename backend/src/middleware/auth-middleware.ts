import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

/**
 * Middleware for authenticating JWT tokens
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Next middleware function
 * @returns void
 * 
 * @description
 * - Validates Authorization header
 * - Verifies JWT token
 * - Attaches decoded user information to request
 * - Passes control to next middleware or route handler
 */
export const authentification = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Validate authorization header
    const header = req.headers.authorization;
    if (!header) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Extract and validate token
    const token = header.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Verify token using JWT secret
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Attach decoded user to request
    req["currentUser"] = decode;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }
};