import { NextFunction, Request, Response, ErrorRequestHandler } from "express";

/**
 * Global error handling middleware
 * 
 * @param error - Error object containing error information
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Next middleware function
 * @returns void
 * 
 * @description
 * - Catches unhandled errors in the application
 * - Logs error details to console
 * - Sends standardized error response to client
 * - Prevents application from crashing on unexpected errors
 */
export const errorHandler: ErrorRequestHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(`Error: ${error.message}`);
  res.status(500).json({ message: "Internal server error" });
};