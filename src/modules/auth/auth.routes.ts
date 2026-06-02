import { Router } from "express";
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { login, logout, me } from "./auth.controller";
import { loginSchema } from "./auth.validation";
import { validateBody } from '../../shared/middlewares/validate.middleware';

const router = Router();

router.post("/login", validateBody(loginSchema), login);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, me);

export default router;
