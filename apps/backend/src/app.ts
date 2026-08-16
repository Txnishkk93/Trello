import express from "express";
import cors from "cors";
import { corsOrigins } from "./config/env.js";
import routes from "./routes/index.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/notFound.middleware.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: corsOrigins, credentials: true }));
  app.use(express.json({ limit: "1mb" }));

  app.use("/api/v1", routes);

  // Order matters: 404 for unmatched routes, then the error handler last.
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
