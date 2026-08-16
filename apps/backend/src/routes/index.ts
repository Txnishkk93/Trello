import { Router } from "express";
import authRoutes from "./auth.routes.js";
import organisationRoutes from "./organisation.routes.js";
import membershipRoutes from "./membership.routes.js";
import boardRoutes from "./board.routes.js";
import sectionRoutes from "./section.routes.js";
import issueRoutes from "./issue.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ success: true, data: { status: "ok" } });
});

router.use("/auth", authRoutes);
router.use("/organisations", organisationRoutes);
router.use("/memberships", membershipRoutes);
router.use("/boards", boardRoutes);
router.use("/sections", sectionRoutes);
router.use("/issues", issueRoutes);

export default router;
