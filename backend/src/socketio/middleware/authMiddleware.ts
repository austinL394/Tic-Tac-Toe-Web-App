import * as jwt from "jsonwebtoken";
import { Socket } from "socket.io";

import { AppDataSource } from "../../data-source";
import { User } from "../../entity/User";
import { TokenPayload } from "../socketServer";

export class AuthMiddleware {
  private userRepository = AppDataSource.getRepository(User);

  constructor(private jwtSecret: string = "") {}

  private verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.jwtSecret) as TokenPayload;
    } catch (error) {
      console.error("Token verification failed:", error);
      return null;
    }
  }

  async authenticate(socket: Socket, next: (err?: Error) => void) {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication token required"));
      }

      const decoded = this.verifyToken(token);
      if (!decoded) {
        return next(new Error("Invalid authentication token"));
      }

      const user = await this.userRepository.findOne({
        where: { id: decoded.id },
      });

      if (!user) {
        return next(new Error("User not found"));
      }

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
