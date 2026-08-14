import pino from "pino";
import { env } from "../config/env";

const isTest = env.NODE_ENV === "test";
const isProduction = env.NODE_ENV === "production";

export const logger = pino({
  // Silence logs entirely during test runs so expected/mocked failure paths
  // (e.g. LLM fallback tests) don't spam the test reporter's output.
  level: isTest ? "silent" : isProduction ? "info" : "debug",
  // Human-readable, colorized output in development; plain JSON in
  // production (better suited for log aggregators/log shipping).
  transport:
    isProduction || isTest
      ? undefined
      : {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
});
