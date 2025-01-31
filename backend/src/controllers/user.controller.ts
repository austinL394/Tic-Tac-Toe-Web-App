import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { encrypt } from "../helpers/helpers";
import * as cache from "memory-cache";

export class UserController {
  static signup = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password, role } = req.body;
      console.log("step1", { name, email, password, role});
      const encryptedPassword = await encrypt.encryptpass(password);
      const user = new User();
      user.name = name;
      user.email = email;
      user.password = encryptedPassword;
      user.role = role;
      console.log("step2 new user", user.role);

      const userRepository = AppDataSource.getRepository(User);
      await userRepository.save(user);

      const token = encrypt.generateToken({ id: user.id });

      res.status(200).json({ message: "User created successfully", token, user });
    } catch (error) {
      res.status(500).json({ message: "Error creating user", error });
    }
  };

  static getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = cache.get("data");
      if (data) {
        console.log("serving from cache");
        res.status(200).json({ data });
      } else {
        console.log("serving from db");
        const userRepository = AppDataSource.getRepository(User);
        const users = await userRepository.find();

        cache.put("data", users, 6000);
        res.status(200).json({ data: users });
      }
    } catch (error) {
      res.status(500).json({ message: "Error fetching users", error });
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

      user.name = name;
      user.email = email;
      await userRepository.save(user);
      res.status(200).json({ message: "updated", user });
    } catch (error) {
      res.status(500).json({ message: "Error updating user", error });
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
      res.status(500).json({ message: "Error deleting user", error });
    }
  };
}