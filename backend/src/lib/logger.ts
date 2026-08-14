import pino from "pino";
import { env } from "../config/env";

const isTest = env.NODE_ENV === "test";
const isProduction = env.NODE_ENV === "production";
const usePrettyOutput = !isTest && env.LOG_PRETTY;

export const logger = pino({
  // Silence logs entirely during test runs so expected/mocked failure paths
  // (e.g. LLM fallback tests) don't spam the test reporter's output.
  level: isTest ? "silent" : isProduction ? "info" : "debug",
  // Human-readable, colorized console output by default (including in
  // Docker) via LOG_PRETTY=true (the default). Set LOG_PRETTY=false for
  // raw JSON lines instead, e.g. when shipping logs to an aggregator that
  // parses structured JSON.
  transport: usePrettyOutput
    ? {
        target: "pino-pretty",
        options: {
          // Force colorize even when stdout isn't detected as a TTY (e.g.
          // `docker-compose logs`, which still renders ANSI codes fine) —
          // only disable it explicitly via LOG_PRETTY=false.
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});
