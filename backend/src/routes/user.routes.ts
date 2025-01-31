import * as express from "express";
import { authentification } from "../middleware/auth-middleware";
import { UserController } from "../controllers/user.controller";
import { authorization } from "../middleware/auth-middleware";
import { AuthController } from "../controllers/auth.controller";
const Router = express.Router();

Router.get(
  "/users",
  authentification,
  UserController.getUsers
);
Router.get(
  "/profile",
  authentification,
  AuthController.getProfile
);
Router.post("/register", UserController.signup);
Router.post("/login", AuthController.login);
Router.put(
  "/update/:id",
  authentification,
  UserController.updateUser
);
Router.delete(
  "/delete/:id",
  authentification,
  UserController.deleteUser
);
export { Router as userRouter };