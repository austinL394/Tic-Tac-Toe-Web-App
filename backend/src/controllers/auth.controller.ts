import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { encrypt } from "../helpers/helpers";

export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        res.status(400).json({ message: "Username and password required" });
        return;
      }

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { username: username },
      });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const isPasswordValid = await encrypt.comparepassword(
        user.password,
        password
      );
      if (!isPasswordValid) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      const token = encrypt.generateToken({ id: user.id });

      // Remove password from user object before sending response
      const { password: _, ...userWithoutPassword } = user;

      res.status(200).json({
        message: "Login successful",
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req["currentUser"]) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      // Generate a new JWT token
      const newToken = encrypt.generateToken({ id: req["currentUser"].id });

      // Remove password from user object before sending response
      const { password: _, ...userWithoutPassword } = req["currentUser"];

      res.status(200).json({
        success: true,
        message: "Profile retrieved successfully",
        user: userWithoutPassword,
        token: newToken,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
