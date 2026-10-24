import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { authenticate } from "../middleware/authenticate.js";

export const authRouter: Router = Router();

authRouter.post("/register", AuthController.register);
authRouter.post("/login", AuthController.login);
authRouter.post("/reset-password", AuthController.resetPassword);
authRouter.post("/refresh", AuthController.refresh);
authRouter.post("/logout", AuthController.logout);
authRouter.get("/me", authenticate, AuthController.getMe);
