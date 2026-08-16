// Augments Express's Request type with the fields our auth middleware attaches,
// so controllers get real autocomplete/type-checking instead of `req: any`.
import "express";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export {};
