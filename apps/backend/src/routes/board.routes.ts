import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { requireOrgMember } from "../middleware/rbac.middleware.js";
import { createBoardSchema, updateBoardSchema } from "../schemas/board.schema.js";
import * as boardController from "../controllers/board.controller.js";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  validateBody(createBoardSchema),
  requireOrgMember,
  boardController.createBoard
);
router.get("/", boardController.listBoards);
router.put("/", validateBody(updateBoardSchema), boardController.updateBoard);
router.delete("/", boardController.deleteBoard);

export default router;
