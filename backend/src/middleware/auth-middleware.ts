import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";

import * as dotenv from "dotenv";
dotenv.config();

export const authentification = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const header = req.headers.authorization;
    if (!header) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const token = header.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    req["currentUser"] = decode;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }
};

export const authorization = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { id: req[" currentUser"].id },
    });
    console.log(user);
    next();
  };
};
