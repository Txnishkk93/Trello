import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { requireOrgAdmin } from "../middleware/rbac.middleware.js";
import { createOrgSchema, deleteOrgSchema } from "../schemas/organisation.schema.js";
import * as orgController from "../controllers/organisation.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", validateBody(createOrgSchema), orgController.createOrganisation);
router.get("/", orgController.listOrganisations);
router.delete(
  "/",
  validateBody(deleteOrgSchema),
  requireOrgAdmin,
  orgController.deleteOrganisation
);

export default router;
