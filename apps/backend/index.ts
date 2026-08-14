import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "db/client";
import jwt from "jsonwebtoken";
import { UserScalarFieldEnum } from "../../packages/db/generated/prisma/internal/prismaNamespace";
import { stat } from "node:fs";
import { memoryUsage } from "node:process";
import { getHeapCodeStatistics } from "node:v8";

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
            message: "Organization Name is required"
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

app.get("/organization", async (req, res) => {
    try {
        const userId = req.userId;
        const memberships = await prisma.membership.findMany({
            where: {
                userId: userId,

            },
            include: {
                organisation: true,
            }
        });

        const organisations = memberships.map(membership => membership.organisation);

        return res.status(200).json({
            message: "Organization retrieved successufully",
            organisations: organisations
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
})

app.delete("/organization", async (req, res) => {
    try {
        const {orgId}=req.body as{
            orgId?:string
        }

        if(!orgId){
            return res.status(404).json({
                message:"Org doesn't exist"
            })
        }



    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
})

app.post("/invite", async (req, res) => {

    try {
        const { email, orgId } = req.body as {
            email?: string,
            orgId?: string
        }

        if (!email || !orgId) {
            return res.status(400).json({
                message: "Email and OrgId are required"
            });
        }

        const orgExists = await prisma.organisation.findUnique({
            where: { id: orgId }
        });

        if (!orgExists) {
            return res.status(404).json({
                message: "Organization not found"
            });
        }

        const adminExists = await prisma.membership.findFirst({
            where: {
                userId: req.userId,
                orgId: orgId,
                role: "ADMIN"
            }
        });

        if (!adminExists) {
            return res.status(403).json({
                message: "Only admins can invite users"
            })
        }

        const userExists = await prisma.user.findUnique({
            where: { email }
        })

        if (!userExists) {
            return res.status(404).json({
                message: "User with this email not found"
            })
        }

        const alreadyMember = await prisma.membership.findFirst({
            where: {
                userId: userExists.id,
                orgId: orgId
            }
        })

        if (alreadyMember) {
            return res.status(409).json({
                message: "User is already a member of this organization"
            })
        }

        const membership = await prisma.membership.create({
            data: {
                userId: userExists.id,
                orgId: orgId,
                role: "MEMBER",
                status: "PENDING"
            }
        })

        return res.status(201).json({
            message: "Invite created successfully",
            membership: membership
        })
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        })
    }

})

app.post("/accept", async (req, res) => {
    try {
        const { orgId } = req.body as {
            orgId?: string
        }

        if (!orgId) {
            return res.status(400).json({
                message: "OrgId is required"
            });
        }

        const pendingInvite = await prisma.membership.findFirst({
            where: {
                userId: req.userId,
                orgId: orgId,
                status: "PENDING"
            }
        })

        if (!pendingInvite) {
            return res.status(404).json({
                message: "No pending invite found for this user "
            })
        }

        const acceptedMembership = await prisma.membership.update({
            where: {
                id: pendingInvite.id
            },
            data: {
                status: "ACTIVE"
            }
        });

        return res.status(200).json({
            message: "Invite accepted successfully",
            membership: acceptedMembership
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        })
    }
})

app.delete("/membership", async (req, res) => {
    try {
        const { userId, orgId } = req.body as {
            userId?: string,
            orgId?: string
        }

        if (!userId || !orgId) {
            return res.status(404).json({
                message: "UserId and OrgId are required"
            })
        }

        const requesterIsAdmin=await prisma.membership.findFirst({
            where:{
                userId:userId,
                orgId:orgId,
                role:"ADMIN"
            }
        })
        if(!requesterIsAdmin){
            return res.status(403).json({
                message:"Only admins can remove members"
            })
        }


        const checkMembership = await prisma.membership.findFirst({
            where: {
                userId: userId,
                orgId: orgId,
            }
        })
        if (!checkMembership) {
            return res.status(404).json({
                message: "Membership doesn't exist"
            })
        }

        if(checkMembership.role==="ADMIN"){
            const adminCount=await prisma.membership.count({
                where:{
                    orgId:orgId,
                    role:"ADMIN"
                }
            });
            if(adminCount===1){
                return res.status(400).json({
                    message:"Cannot remove the last admin of the organization"
                })
            }
        }

        await prisma.membership.delete({
            where: {
               id:checkMembership.id
            }
        })

        return res.status(200).json({
            message: "Member successfully removed"
        })


    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
})

app.post("/board",async (req,res)=>{
    const {username,orgId}=req.body as{
        username?:string,
        orgId?:string
    }

    
})

app.listen(3000, () => {
    console.log("Backend running on http://localhost:3000");
});

