// Points the test run at a dedicated Postgres database so integration tests
// never touch dev/seed data. Runs before any src module (incl. src/config/env)
// is imported, and before dotenv/config, so this value takes precedence.
process.env.DATABASE_URL =
  "postgresql://postgres:postgres@localhost:5439/task_assignment_test?schema=public";
process.env.NODE_ENV = "test";
process.env.PORT = process.env.PORT ?? "4001";
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173";
// Force the keyword fallback in tests so LLM behavior is deterministic and
// no network calls are made during the test run.
process.env.GEMINI_API_KEY = "";
