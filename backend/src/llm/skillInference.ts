import { getGeminiModel } from "./geminiClient";
import { logger } from "../lib/logger";
import { CANONICAL_SKILLS, normalizeSkillNames } from "../utils/skillNames";

const FALLBACK_KEYWORDS: Record<string, string[]> = {
  Frontend: [
    "ui",
    "ux",
    "page",
    "screen",
    "css",
    "react",
    "component",
    "frontend",
    "front-end",
    "design",
    "form",
    "button",
    "layout",
    "style",
  ],
  Backend: [
    "api",
    "database",
    "db",
    "server",
    "backend",
    "back-end",
    "endpoint",
    "migration",
    "auth",
    "queue",
    "schema",
    "integration",
    "service",
  ],
};

/**
 * Best-effort keyword matching used when the LLM is unavailable or returns an
 * unusable response. Returns an empty array if nothing matches rather than
 * guessing, so callers can decide how to handle "unknown" skills. Uses word
 * boundaries so short keywords (e.g. "ui") don't match inside unrelated
 * words (e.g. "Build").
 */
function keywordFallback(title: string): string[] {
  const lower = title.toLowerCase();
  return CANONICAL_SKILLS.filter((skill) =>
    FALLBACK_KEYWORDS[skill].some((kw) => new RegExp(`\\b${kw}\\b`, "i").test(lower)),
  );
}

function buildPrompt(title: string): string {
  return [
    "You are classifying software engineering tasks by the skill(s) required to complete them.",
    `Allowed skills: ${CANONICAL_SKILLS.join(", ")}.`,
    `Task title: "${title}"`,
    'Respond with ONLY a JSON array of the applicable skill names from the allowed list, e.g. ["Frontend"] or ["Frontend","Backend"]. If unsure, make your best guess. Do not include any explanation or markdown formatting.',
  ].join("\n");
}

function parseSkillsFromResponse(text: string): string[] {
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
  if (!Array.isArray(parsed)) {
    throw new Error("LLM response is not a JSON array");
  }
  return normalizeSkillNames(parsed.filter((item): item is string => typeof item === "string"));
}

/**
 * Infers the required skill(s) for a task from its title using Gemini.
 * Retries once on failure, then falls back to keyword matching. Never
 * throws — always resolves to a (possibly empty) list of canonical skills.
 */
export async function inferSkills(title: string): Promise<string[]> {
  const model = getGeminiModel();
  if (!model) {
    logger.warn("GEMINI_API_KEY not configured, using keyword fallback for skill inference");
    return keywordFallback(title);
  }

  const maxAttempts = 2;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await model.generateContent(buildPrompt(title));
      const text = result.response.text().trim();
      return parseSkillsFromResponse(text);
    } catch (err) {
      logger.warn({ err, attempt }, "Gemini skill inference attempt failed");
    }
  }

  logger.warn("Gemini skill inference failed after retries, using keyword fallback");
  return keywordFallback(title);
}
