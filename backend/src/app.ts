import cors from "cors";
import express, { Express } from "express";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import { logger } from "./lib/logger";
import { errorHandler } from "./middleware/errorHandler";
import { router } from "./routes";

export function createApp(): Express {
  const app = express();

  // Supports a comma-separated list so multiple local dev ports (or a
  // deployed frontend origin) can be allowed without code changes.
  const allowedOrigins = env.CORS_ORIGIN.split(",").map((origin) => origin.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
    }),
  );
  app.use(express.json());
  app.use(pinoHttp({ logger }));

  app.use("/api/v1", router);

  app.use((req, res) => {
    res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: `Route ${req.method} ${req.originalUrl} not found`,
      },
    });
  });

  app.use(errorHandler);

  return app;
}
