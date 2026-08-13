import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { env } from "../config/env";

let client: GoogleGenerativeAI | null = null;

/**
 * Lazily constructs the Gemini client/model. Returns null when no API key is
 * configured so callers can fall back gracefully instead of throwing.
 */
export function getGeminiModel(): GenerativeModel | null {
  if (!env.GEMINI_API_KEY) return null;
  if (!client) client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  return client.getGenerativeModel({ model: env.GEMINI_MODEL });
}
