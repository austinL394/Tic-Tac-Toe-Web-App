import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { encrypt } from "../helpers/helpers";

export class UserController {
  static signup = async (req: Request, res: Response): Promise<void> => {
    try {
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

      const token = encrypt.generateToken({ id: user.id });

      res
        .status(200)
        .json({ message: "User created successfully", token, user });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error creating user" });
    }
  };

  static updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, email } = req.body;
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id },
      });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      user.username = name;
      user.email = email;
      await userRepository.save(user);
      res.status(200).json({ message: "updated", user });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error updating user" });
    }
  };

  static deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id },
      });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      await userRepository.remove(user);
      res.status(200).json({ message: "ok" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error deleting user" });
    }
  };
}
