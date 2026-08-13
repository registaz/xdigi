export const CANONICAL_SKILLS = ["Frontend", "Backend"] as const;

export type CanonicalSkill = (typeof CANONICAL_SKILLS)[number];

/**
 * Normalizes a raw skill name to one of the canonical skill names when it
 * matches case-insensitively. Falls back to the trimmed original value for
 * any skill outside the canonical set (schema does not restrict skill names
 * to only these two, but the seed data / spec only defines these).
 */
export function normalizeSkillName(raw: string): string {
  const trimmed = raw.trim();
  const canonical = CANONICAL_SKILLS.find((c) => c.toLowerCase() === trimmed.toLowerCase());
  return canonical ?? trimmed;
}

export function normalizeSkillNames(raw: string[]): string[] {
  const seen = new Set<string>();
  for (const item of raw) {
    const normalized = normalizeSkillName(item);
    if (normalized.length > 0) seen.add(normalized);
  }
  return Array.from(seen);
}
