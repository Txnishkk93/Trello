import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { requireOrgAdmin } from "../middleware/rbac.middleware.js";
import {
  acceptSchema,
  deleteMembershipSchema,
  inviteSchema,
} from "../schemas/membership.schema.js";
import * as membershipController from "../controllers/membership.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/", membershipController.getMembers);
router.post("/invite", validateBody(inviteSchema), requireOrgAdmin, membershipController.invite);
router.post("/accept", validateBody(acceptSchema), membershipController.accept);
router.delete(
  "/",
  validateBody(deleteMembershipSchema),
  requireOrgAdmin,
  membershipController.removeMembership
);

export default router;
