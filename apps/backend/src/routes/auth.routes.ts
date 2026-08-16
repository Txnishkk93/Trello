import { Router } from "express";
import { validateBody } from "../middleware/validate.middleware.js";
import { signinSchema, signupSchema } from "../schemas/auth.schema.js";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

router.post("/signup", validateBody(signupSchema), authController.signup);
router.post("/signin", validateBody(signinSchema), authController.signin);

export default router;
