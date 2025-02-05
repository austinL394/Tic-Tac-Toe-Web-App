import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { encrypt } from "../helpers/helpers";

export class AuthController {
  /**
   * Handles user login authentication
   *
   * @param req - HTTP request containing username and password
   * @param res - HTTP response for login result
   * @returns Promise resolving to void
   *
   * @description
   * - Validates user credentials
   * - Checks user existence in database
   * - Verifies password
   * - Generates authentication token
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate and extract login credentials
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ message: "Username and password required" });
        return;
      }

      // Find user and validate credentials
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

      // Generate token and prepare response
      const token = encrypt.generateToken({ id: user.id });
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

  /**
   * Creates a new user account
   *
   * @param req - HTTP request object containing user registration details
   * @param res - HTTP response object for sending registration result
   * @returns Promise resolving to void
   */
  static signup = async (req: Request, res: Response): Promise<void> => {
    try {
      // Extract and encrypt user registration data, then save to database
      const { firstName, lastName, username, email, password } = req.body;

      const encryptedPassword = await encrypt.encryptpass(password);
      const user = new User();
      user.firstName = firstName;
      user.lastName = lastName;
      user.username = username;
      user.email = email;
      user.password = encryptedPassword;

      const userRepository = AppDataSource.getRepository(User);
      await userRepository.save(user);

      // Generate authentication token and send successful response
      const token = encrypt.generateToken({ id: user.id });

      res
        .status(200)
        .json({ message: "User created successfully", token, user });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error creating user" });
    }
  };
}
