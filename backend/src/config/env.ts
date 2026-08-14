import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL_STABLE: z.string().default("gemini-flash-latest"),
  GEMINI_MODEL_FALLBACK: z.string().default("gemini-3.5-flash-lite"),
  // Human-readable colorized console logs by default (incl. in Docker).
  // Set to "false" to emit raw JSON lines instead (e.g. for a log
  // aggregator that parses structured logs). Note: z.coerce.boolean()
  // treats any non-empty string (incl. "false") as true, so this is
  // parsed manually instead.
  LOG_PRETTY: z
    .string()
    .default("true")
    .transform((val) => val.trim().toLowerCase() !== "false" && val.trim() !== "0"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  return parsed.data;
}

export const env = loadEnv();
