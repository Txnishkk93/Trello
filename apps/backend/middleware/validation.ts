import { Response, NextFunction } from "express";
import { z } from "zod";

export function validateBody(schema: z.ZodSchema) {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
        });
      }
      return res.status(400).json({
        error: "Invalid request body",
      });
    }
  };
}
