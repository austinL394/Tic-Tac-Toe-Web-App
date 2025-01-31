import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { encrypt } from "../helpers/helpers";

export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ message: "Email and password required" });
        return;
      }

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { email } });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const isPasswordValid = await encrypt.comparepassword(user.password, password);
      if (!isPasswordValid) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      const token = encrypt.generateToken({ id: user.id });
      res.status(200).json({ message: "Login successful", user, token });
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

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: req["currentUser"].id },
      });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}