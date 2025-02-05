import * as jwt from "jsonwebtoken";
import { Socket } from "socket.io";

import { AppDataSource } from "../../data-source";
import { User } from "../../entity/User";
import { TokenPayload } from "../socketServer";

/**
 * Authentication middleware for WebSocket connections
 * Handles token verification and user authentication
 */
export class AuthMiddleware {
  private userRepository = AppDataSource.getRepository(User);

  constructor(private jwtSecret: string = "") {}

  /**
   * Verifies the JWT token
   *
   * @param token - JWT token to verify
   * @returns Decoded token payload or null if verification fails
   *
   * @description
   * - Attempts to verify the JWT token using the secret key
   * - Returns decoded payload if successful
   * - Returns null if token verification fails
   */
  private verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.jwtSecret) as TokenPayload;
    } catch (error) {
      console.error("Token verification failed:", error);
      return null;
    }
  }

  /**
   * Authenticates WebSocket connection
   *
   * @param socket - Socket.IO socket connection
   * @param next - Callback to proceed or reject the connection
   *
   * @description
   * - Extracts token from socket handshake
   * - Verifies token authenticity
   * - Retrieves user from database
   * - Attaches user data to socket
   * - Allows or rejects the connection
   */
  async authenticate(socket: Socket, next: (err?: Error) => void) {
    try {
      // Validate token presence
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication token required"));
      }

      // Verify token
      const decoded = this.verifyToken(token);
      if (!decoded) {
        return next(new Error("Invalid authentication token"));
      }

      // Find user in database
      const user = await this.userRepository.findOne({
        where: { id: decoded.id },
      });

      // Validate user existence
      if (!user) {
        return next(new Error("User not found"));
      }

      // Attach user data to socket
      socket.data = {
        userId: decoded.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      };
      next();
    } catch (error) {
      next(new Error("Authentication failed"));
    }
  }
}
