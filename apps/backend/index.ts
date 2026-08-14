import express from "express";
import type { Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "db/client";
import jwt from "jsonwebtoken";
import { z } from "zod";
import {
  authMiddleware,
  validateBody,
  requireOrgMember,
  requireOrgAdmin,
} from "./middleware";

const jwtSecret = process.env.JWT_SECRET ?? process.env.JWT_SCERET;

if (!jwtSecret) {
    throw new Error("JWT_SECRET is missing. Add it to packages/db/.env");
}

const app = express();
app.use(express.json());

const signupSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signinSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string(),
});

const createOrgSchema = z.object({
  username: z.string().min(1, "Organization name is required"),
  description: z.string().optional(),
});

const inviteSchema = z.object({
  email: z.string().email("Invalid email"),
  orgId: z.string().min(1, "orgId is required"),
});

const acceptSchema = z.object({
  orgId: z.string().min(1, "orgId is required"),
});

const deleteMembershipSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  orgId: z.string().min(1, "orgId is required"),
});

const createBoardSchema = z.object({
  title: z.string().min(1, "Board title is required"),
  orgId: z.string().min(1, "orgId is required"),
});

const updateBoardSchema = z.object({
  boardId: z.string().min(1, "boardId is required"),
  title: z.string().min(1, "Board title is required"),
});

const createSectionSchema = z.object({
  title: z.string().min(1, "Section title is required"),
  boardId: z.string().min(1, "boardId is required"),
});

const updateSectionSchema = z.object({
  sectionId: z.string().min(1, "sectionId is required"),
  title: z.string().min(1, "Section title is required"),
});

const createIssueSchema = z.object({
  title: z.string().min(1, "Issue title is required"),
  description: z.string().optional(),
  sectionId: z.string().min(1, "sectionId is required"),
  boardId: z.string().min(1, "boardId is required"),
});

const updateIssueSchema = z.object({
  issueId: z.string().min(1, "issueId is required"),
  title: z.string().optional(),
  description: z.string().optional(),
});

const deleteOrgSchema = z.object({
  orgId: z.string().min(1, "orgId is required"),
});

app.post("/signup", validateBody(signupSchema), async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (userExists) {
      return res.status(409).json({
        error: "Username or email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

app.post("/signin", validateBody(signinSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const token = jwt.sign({ userId: user.id }, jwtSecret, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

app.post(
  "/organization",
  authMiddleware,
  validateBody(createOrgSchema),
  async (req: any, res) => {
    try {
      const { username, description } = req.body;
      const userId = req.userId;

      const result = await prisma.$transaction(async (tx) => {
        const org = await tx.organisation.create({
          data: {
            username,
            description: description || "",
            adminId: userId,
          },
        });

        const membership = await tx.membership.create({
          data: {
            userId,
            orgId: org.id,
            role: "ADMIN",
          },
        });

        return { org, membership };
      });

      return res.status(201).json({
        id: result.org.id,
        username: result.org.username,
        description: result.org.description,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

app.get("/organizations", authMiddleware, async (req: any, res) => {
  try {
    const userId = req.userId;

    const memberships = await prisma.membership.findMany({
      where: { userId },
      include: { org: true },
    });

    const organizations = memberships.map((m) => ({
      id: m.org.id,
      username: m.org.username,
      description: m.org.description,
      role: m.role,
    }));

    return res.status(200).json(organizations);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

app.delete(
  "/organization",
  authMiddleware,
  validateBody(deleteOrgSchema),
  requireOrgAdmin,
  async (req: any, res) => {
    try {
      const { orgId } = req.body;

      const org = await prisma.organisation.findUnique({
        where: { id: orgId },
      });

      if (!org) {
        return res.status(404).json({
          error: "Organization not found",
        });
      }

      await prisma.$transaction(async (tx) => {
        const boards = await tx.board.findMany({
          where: { orgId },
          include: {
            sections: {
              include: { issues: { select: { id: true } } },
            },
          },
        });

        for (const board of boards) {
          for (const section of board.sections) {
            for (const issue of section.issues) {
              await tx.issueMapping.deleteMany({
                where: { issueId: issue.id },
              });
            }
          }
        }

        await tx.issue.deleteMany({
          where: {
            section: { board: { orgId } },
          },
        });

        await tx.section.deleteMany({
          where: { board: { orgId } },
        });

        await tx.board.deleteMany({
          where: { orgId },
        });

        await tx.membership.deleteMany({
          where: { orgId },
        });

        await tx.organisation.delete({
          where: { id: orgId },
        });
      });

      return res.status(200).json({
        message: "Organization deleted successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

app.post(
  "/invite",
  authMiddleware,
  validateBody(inviteSchema),
  requireOrgAdmin,
  async (req: any, res) => {
    try {
      const { email, orgId } = req.body;

      const org = await prisma.organisation.findUnique({
        where: { id: orgId },
      });

      if (!org) {
        return res.status(404).json({
          error: "Organization not found",
        });
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      const existingMembership = await prisma.membership.findFirst({
        where: {
          userId: user.id,
          orgId,
        },
      });

      if (existingMembership) {
        return res.status(409).json({
          error: "User is already a member of this organization",
        });
      }

      const membership = await prisma.membership.create({
        data: {
          userId: user.id,
          orgId,
          role: "MEMBER",
        },
      });

      return res.status(201).json({
        id: membership.id,
        userId: membership.userId,
        orgId: membership.orgId,
        role: membership.role,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

app.post(
  "/accept",
  authMiddleware,
  validateBody(acceptSchema),
  async (req: any, res) => {
    try {
      const { orgId } = req.body;
      const userId = req.userId;

      const membership = await prisma.membership.findFirst({
        where: {
          userId,
          orgId,
        },
      });

      if (!membership) {
        return res.status(404).json({
          error: "No invite found for this organization",
        });
      }

      return res.status(200).json({
        message: "Organization accepted",
        membership,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// DELETE /membership
app.delete(
    "/membership",
    authMiddleware,
    validateBody(deleteMembershipSchema),
    requireOrgAdmin,
    async (req: any, res) => {
        try {
            const { userId, orgId } = req.body;

            // Verify membership exists
            const membership = await prisma.membership.findFirst({
                where: { userId, orgId },
            });

            if (!membership) {
                return res.status(404).json({
                    error: "Membership not found",
                });
            }

            // If removing an admin, check it's not the last one
            if (membership.role === "ADMIN") {
                const adminCount = await prisma.membership.count({
                    where: { orgId, role: "ADMIN" },
                });

                if (adminCount === 1) {
                    return res.status(400).json({
                        error: "Cannot remove the last admin of the organization",
                    });
                }
            }

            // Delete membership
            await prisma.membership.delete({
                where: { id: membership.id },
            });

            return res.status(200).json({
                message: "Member removed successfully",
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                error: "Internal server error",
            });
        }
    }
);

app.post(
  "/board",
  authMiddleware,
  validateBody(createBoardSchema),
  requireOrgMember,
  async (req: any, res) => {
    try {
      const { title, orgId } = req.body;

      const board = await prisma.board.create({
        data: {
          title,
          orgId,
        },
      });

      return res.status(201).json(board);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// GET /boards?orgId=
app.get("/boards", authMiddleware, async (req: any, res) => {
    try {
        const { orgId } = req.query;

        if (!orgId) {
            return res.status(400).json({
                error: "orgId query parameter is required",
            });
        }

        // Check membership
        const membership = await prisma.membership.findFirst({
            where: {
                userId: req.userId,
                orgId: orgId as string,
            },
        });

        if (!membership) {
            return res.status(403).json({
                error: "You are not a member of this organization",
            });
        }

        // Query boards
        const boards = await prisma.board.findMany({
            where: { orgId: orgId as string },
        });

        return res.status(200).json(boards);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
});

app.put(
  "/board",
  authMiddleware,
  validateBody(updateBoardSchema),
  async (req: any, res) => {
    try {
      const { boardId, title } = req.body;

      const board = await prisma.board.findUnique({
        where: { id: boardId },
      });

      if (!board) {
        return res.status(404).json({
          error: "Board not found",
        });
      }

      const membership = await prisma.membership.findFirst({
        where: {
          userId: req.userId,
          orgId: board.orgId,
        },
      });

      if (!membership) {
        return res.status(403).json({
          error: "You don't have access to this board",
        });
      }

      const updatedBoard = await prisma.board.update({
        where: { id: boardId },
        data: { title },
      });

      return res.status(200).json(updatedBoard);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

app.delete("/board", authMiddleware, async (req: any, res) => {
  try {
    const { boardId } = req.body;

    if (!boardId) {
      return res.status(400).json({
        error: "boardId is required",
      });
    }

    const board = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      return res.status(404).json({
        error: "Board not found",
      });
    }

    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.userId,
        orgId: board.orgId,
      },
    });

    if (!membership) {
      return res.status(403).json({
        error: "You don't have access to this board",
      });
    }

    await prisma.$transaction(async (tx) => {
      const sections = await tx.section.findMany({
        where: { boardId },
        select: { id: true },
      });

      const issues = await tx.issue.findMany({
        where: {
          section: { boardId },
        },
        select: { id: true },
      });

      for (const issue of issues) {
        await tx.issueMapping.deleteMany({
          where: { issueId: issue.id },
        });
      }

      await tx.issue.deleteMany({
        where: { section: { boardId } },
      });

      await tx.section.deleteMany({
        where: { boardId },
      });

      await tx.board.delete({
        where: { id: boardId },
      });
    });

    return res.status(200).json({
      message: "Board deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

app.post(
  "/section",
  authMiddleware,
  validateBody(createSectionSchema),
  async (req: any, res) => {
    try {
      const { title, boardId } = req.body;

      const board = await prisma.board.findUnique({
        where: { id: boardId },
      });

      if (!board) {
        return res.status(404).json({
          error: "Board not found",
        });
      }

      const membership = await prisma.membership.findFirst({
        where: {
          userId: req.userId,
          orgId: board.orgId,
        },
      });

      if (!membership) {
        return res.status(403).json({
          error: "You don't have access to this board",
        });
      }

      const section = await prisma.section.create({
        data: {
          title,
          boardId,
        },
      });

      return res.status(201).json(section);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

app.put(
  "/section",
  authMiddleware,
  validateBody(updateSectionSchema),
  async (req: any, res) => {
    try {
      const { sectionId, title } = req.body;

      const section = await prisma.section.findUnique({
        where: { id: sectionId },
        include: { board: true },
      });

      if (!section) {
        return res.status(404).json({
          error: "Section not found",
        });
      }

      const membership = await prisma.membership.findFirst({
        where: {
          userId: req.userId,
          orgId: section.board.orgId,
        },
      });

      if (!membership) {
        return res.status(403).json({
          error: "You don't have access to this section",
        });
      }

      const updatedSection = await prisma.section.update({
        where: { id: sectionId },
        data: { title },
      });

      return res.status(200).json(updatedSection);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

app.delete("/section", authMiddleware, async (req: any, res) => {
  try {
    const { sectionId } = req.body;

    if (!sectionId) {
      return res.status(400).json({
        error: "sectionId is required",
      });
    }

    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { board: true },
    });

    if (!section) {
      return res.status(404).json({
        error: "Section not found",
      });
    }

    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.userId,
        orgId: section.board.orgId,
      },
    });

    if (!membership) {
      return res.status(403).json({
        error: "You don't have access to this section",
      });
    }

    await prisma.$transaction(async (tx) => {
      const issues = await tx.issue.findMany({
        where: { sectionId },
        select: { id: true },
      });

      for (const issue of issues) {
        await tx.issueMapping.deleteMany({
          where: { issueId: issue.id },
        });
      }

      await tx.issue.deleteMany({
        where: { sectionId },
      });

      await tx.section.delete({
        where: { id: sectionId },
      });
    });

    return res.status(200).json({
      message: "Section deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

app.get("/sections", authMiddleware, async (req: any, res) => {
  try {
    const { boardId } = req.query;

    if (!boardId) {
      return res.status(400).json({
        error: "boardId query parameter is required",
      });
    }

    const board = await prisma.board.findUnique({
      where: { id: boardId as string },
    });

    if (!board) {
      return res.status(404).json({
        error: "Board not found",
      });
    }

    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.userId,
        orgId: board.orgId,
      },
    });

    if (!membership) {
      return res.status(403).json({
        error: "You don't have access to this board",
      });
    }

    const sections = await prisma.section.findMany({
      where: { boardId: boardId as string },
    });

    return res.status(200).json(sections);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

app.post(
  "/issue",
  authMiddleware,
  validateBody(createIssueSchema),
  async (req: any, res) => {
    try {
      const { title, description, sectionId, boardId } = req.body;

      const section = await prisma.section.findUnique({
        where: { id: sectionId },
        include: { board: true },
      });

      if (!section) {
        return res.status(404).json({
          error: "Section not found",
        });
      }

      const membership = await prisma.membership.findFirst({
        where: {
          userId: req.userId,
          orgId: section.board.orgId,
        },
      });

      if (!membership) {
        return res.status(403).json({
          error: "You don't have access to this section",
        });
      }

      const issue = await prisma.issue.create({
        data: {
          title,
          description: description || "",
          sectionId,
          boardId,
        },
        include: { issueMappings: true },
      });

      return res.status(201).json(issue);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

app.get("/issues", authMiddleware, async (req: any, res) => {
  try {
    const { sectionId, boardId } = req.query;

    if (!sectionId && !boardId) {
      return res.status(400).json({
        error: "Either sectionId or boardId query parameter is required",
      });
    }

    let board;

    if (sectionId) {
      const section = await prisma.section.findUnique({
        where: { id: sectionId as string },
        include: { board: true },
      });

      if (!section) {
        return res.status(404).json({
          error: "Section not found",
        });
      }

      board = section.board;
    } else {
      board = await prisma.board.findUnique({
        where: { id: boardId as string },
      });

      if (!board) {
        return res.status(404).json({
          error: "Board not found",
        });
      }
    }

    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.userId,
        orgId: board.orgId,
      },
    });

    if (!membership) {
      return res.status(403).json({
        error: "You don't have access to this board",
      });
    }

    let issues;

    if (sectionId) {
      issues = await prisma.issue.findMany({
        where: { sectionId: sectionId as string },
        include: { issueMappings: true },
      });
    } else {
      issues = await prisma.issue.findMany({
        where: {
          section: { boardId: boardId as string },
        },
        include: { issueMappings: true },
      });
    }

    return res.status(200).json(issues);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

app.get("/issue/:issueId", authMiddleware, async (req: any, res) => {
  try {
    const { issueId } = req.params;

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        section: { include: { board: true } },
        issueMappings: true,
      },
    });

    if (!issue) {
      return res.status(404).json({
        error: "Issue not found",
      });
    }

    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.userId,
        orgId: issue.section.board.orgId,
      },
    });

    if (!membership) {
      return res.status(403).json({
        error: "You don't have access to this issue",
      });
    }

    return res.status(200).json(issue);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

app.put(
  "/issue",
  authMiddleware,
  validateBody(updateIssueSchema),
  async (req: any, res) => {
    try {
      const { issueId, title, description } = req.body;

      const issue = await prisma.issue.findUnique({
        where: { id: issueId },
        include: { section: { include: { board: true } } },
      });

      if (!issue) {
        return res.status(404).json({
          error: "Issue not found",
        });
      }

      const membership = await prisma.membership.findFirst({
        where: {
          userId: req.userId,
          orgId: issue.section.board.orgId,
        },
      });

      if (!membership) {
        return res.status(403).json({
          error: "You don't have access to this issue",
        });
      }

      const updateData: any = {};

      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          error: "No fields to update",
        });
      }

      const updatedIssue = await prisma.issue.update({
        where: { id: issueId },
        data: updateData,
        include: { issueMappings: true },
      });

      return res.status(200).json(updatedIssue);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

app.delete("/issue/:issueId", authMiddleware, async (req: any, res) => {
  try {
    const { issueId } = req.params;

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: { section: { include: { board: true } } },
    });

    if (!issue) {
      return res.status(404).json({
        error: "Issue not found",
      });
    }

    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.userId,
        orgId: issue.section.board.orgId,
      },
    });

    if (!membership) {
      return res.status(403).json({
        error: "You don't have access to this issue",
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.issueMapping.deleteMany({
        where: { issueId },
      });

      await tx.issue.delete({
        where: { id: issueId },
      });
    });

    return res.status(200).json({
      message: "Issue deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});



// ==================== START SERVER ====================

app.listen(3000, () => {
    console.log("Backend running on http://localhost:3000");
});
