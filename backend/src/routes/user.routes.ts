import * as express from "express";
import { UserController } from "../controllers/user.controller";
import { AuthController } from "../controllers/auth.controller";
const Router = express.Router();

Router.post("/register", UserController.signup);
Router.post("/login", AuthController.login);
Router.get("/check", AuthController.getProfile)

export { Router as userRouter };
