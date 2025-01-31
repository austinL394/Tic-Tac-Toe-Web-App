// src/helpers/helpers.ts

import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import { payload } from "../dto/user.dto";

dotenv.config();
const { JWT_SECRET = "password_secret" } = process.env;

export class encrypt {
  static async encryptpass(password: string): Promise<string> {
    return bcrypt.hashSync(password, 12);
  }

  static comparepassword(hashPassword: string, password: string): boolean {
    return bcrypt.compareSync(password, hashPassword);
  }

  static generateToken(payload: payload): string {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
  }
}