import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import {
  assignIssueSchema,
  createIssueSchema,
  updateIssueSchema,
} from "../schemas/issue.schema.js";
import * as issueController from "../controllers/issue.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", validateBody(createIssueSchema), issueController.createIssue);
router.get("/", issueController.listIssues);
router.get("/:issueId", issueController.getIssue);
router.put("/", validateBody(updateIssueSchema), issueController.updateIssue);
router.delete("/:issueId", issueController.deleteIssue);

router.post("/assign", validateBody(assignIssueSchema), issueController.assignIssue);
router.delete("/:issueId/assign/:userId", issueController.unassignIssue);

export default router;
