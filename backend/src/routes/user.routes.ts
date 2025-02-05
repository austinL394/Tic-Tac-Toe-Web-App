import * as express from "express";
import { AuthController } from "../controllers/auth.controller";
const Router = express.Router();

Router.post("/register", AuthController.signup);
Router.post("/login", AuthController.login);

export { Router as userRouter };
