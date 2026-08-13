import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";
import { logger } from "../lib/logger";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    logger.warn({ err }, "Handled application error");
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request payload",
        details: err.flatten(),
      },
    });
    return;
  }

  logger.error({ err }, "Unhandled error");
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Internal server error" },
  });
};
