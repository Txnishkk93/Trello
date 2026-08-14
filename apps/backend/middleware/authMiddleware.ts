import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
    userId?: string;
}

interface JwtPayload {
    userId: string;
}

const authMiddleware = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Missing or invalid authorization header",
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Missing token",
        });
    }

    try {
        const decoded = jwt.verify(token, jwtsecret);

        if (typeof decoded === "string" || !("userId" in decoded)) {
            return res.status(401).json({
                message: "Invalid token payload",
            });
        }

        req.userId = (decoded as JwtPayload).userId;

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
};

app.use(authMiddleware);