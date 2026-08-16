import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { createSectionSchema, updateSectionSchema } from "../schemas/section.schema.js";
import * as sectionController from "../controllers/section.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", validateBody(createSectionSchema), sectionController.createSection);
router.get("/", sectionController.listSections);
router.put("/", validateBody(updateSectionSchema), sectionController.updateSection);
router.delete("/", sectionController.deleteSection);

export default router;
