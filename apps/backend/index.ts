import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "db/client";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET ?? process.env.JWT_SCERET;

if (!jwtSecret) {
    throw new Error("JWT_SECRET is missing. Add it to packages/db/.env");
}

const app = express();
app.use(express.json());

app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body as {
        username?: string,
        email?: string;
        password?: string
    }

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Missing required fields"
        });
    }
    const userExists = await prisma.user.findFirst({
        where: {
            OR: [{ username }, { email }]
        },
    });
    if (userExists) {
        return res.status(400).json({
            message: "User already exists"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 8)

    const user = await prisma.user.create({
        data: {
            username,
            email,
            password: hashedPassword,
        },
    })
    return res.status(200).json({
        message: "User signed up successfully",
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
        },
    });
});

app.post("/signin", async (req, res) => {
    const { email, password } = req.body as {
        email?: string,
        password?: string
    }

    if (!email || !password) {
        return res.status(400).json({
            message: "Missing required fields"
        })
    }

    const user = await prisma.user.findUnique({
        where: {
            email
        },
    });

    if (!user) {
        return res.status(401).json({
            message: "Invalid User",
        })
    }

    const isPassCorrect = await bcrypt.compare(
        password,
        user.password
    )

    if (!isPassCorrect) {
        return res.status(401).json({
            message: "Invalid Password",
        })
    }

    const token = jwt.sign(
        {
            userId: user.id,
            email: user.email,
        },
        jwtSecret,
        {
            expiresIn: "7d",
        },
    );
    return res.status(200).json({
        message: "User Login successfully",
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
        },

    })
})

app.post("organization", async (req, res) => {
    const userId = req.userId;
    const { username, description } = req.body as {
        username?: string,
        description?: string,
    }

    if (!userId) {
        return res.status(401).json({
            message: "UnAuthorised"
        });
    }

    if (!username) {
        return res.status(401).json({
            message: "Organization is required"
        });
    }

    const result = await prisma.$transaction(async tx => {
        const org = await tx.organisation.create({
            data: {
                username,
                description: description ?? "",
                adminId: userId,
            }
        })
        const membership = await tx.membership.create({
            data: {
                userId,
                orgId: org.id,
                role: "ADMIN",
            },
        });
        return { org, membership };
    })

    return res.status(200).json({
        message: "Organization created successfully ",
        organization: result.org,
        membership: result.membership,
    });


})
app.listen(3000, () => {
    console.log("Backend running on http://localhost:3000");
});

