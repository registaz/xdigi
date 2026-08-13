import { inferSkills } from "../../src/llm/skillInference";
import { getGeminiModel } from "../../src/llm/geminiClient";

jest.mock("../../src/llm/geminiClient", () => ({
  getGeminiModel: jest.fn(),
}));

const mockedGetGeminiModel = getGeminiModel as jest.Mock;

describe("inferSkills", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("falls back to keyword matching when no model is configured", async () => {
    mockedGetGeminiModel.mockReturnValue(null);
    const skills = await inferSkills("Design the login page UI");
    expect(skills).toEqual(["Frontend"]);
  });

  it("returns normalized skills parsed from a valid LLM JSON response", async () => {
    mockedGetGeminiModel.mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: { text: () => '["frontend", "Backend"]' },
      }),
    });
    const skills = await inferSkills("Some task");
    expect([...skills].sort()).toEqual(["Backend", "Frontend"]);
  });

  it("falls back to keyword matching when the LLM returns malformed JSON after retries", async () => {
    mockedGetGeminiModel.mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: { text: () => "not valid json" },
      }),
    });
    const skills = await inferSkills("Build the REST API endpoint");
    expect(skills).toEqual(["Backend"]);
  });

  it("retries once then falls back to keyword matching when the LLM call throws", async () => {
    const generateContent = jest.fn().mockRejectedValue(new Error("network error"));
    mockedGetGeminiModel.mockReturnValue({ generateContent });
    const skills = await inferSkills("Fix database migration script");
    expect(skills).toEqual(["Backend"]);
    expect(generateContent).toHaveBeenCalledTimes(2);
  });

  it("succeeds on the second attempt after one failure", async () => {
    const generateContent = jest
      .fn()
      .mockRejectedValueOnce(new Error("transient error"))
      .mockResolvedValueOnce({ response: { text: () => '["Frontend"]' } });
    mockedGetGeminiModel.mockReturnValue({ generateContent });
    const skills = await inferSkills("Some task");
    expect(skills).toEqual(["Frontend"]);
  });
});
