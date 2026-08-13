import { normalizeSkillName, normalizeSkillNames } from "../../src/utils/skillNames";

describe("normalizeSkillName", () => {
  it("normalizes case-insensitive matches to the canonical form", () => {
    expect(normalizeSkillName("frontend")).toBe("Frontend");
    expect(normalizeSkillName("BACKEND")).toBe("Backend");
  });

  it("trims surrounding whitespace", () => {
    expect(normalizeSkillName("  Frontend  ")).toBe("Frontend");
  });

  it("passes through unknown skill names unchanged (trimmed)", () => {
    expect(normalizeSkillName(" DevOps ")).toBe("DevOps");
  });
});

describe("normalizeSkillNames", () => {
  it("dedupes normalized names regardless of casing/whitespace", () => {
    expect(normalizeSkillNames(["frontend", "Frontend", " FRONTEND "])).toEqual(["Frontend"]);
  });

  it("preserves multiple distinct canonical skills", () => {
    expect(normalizeSkillNames(["backend", "frontend"]).sort()).toEqual(["Backend", "Frontend"]);
  });

  it("drops empty strings", () => {
    expect(normalizeSkillNames(["", "  ", "Frontend"])).toEqual(["Frontend"]);
  });
});
