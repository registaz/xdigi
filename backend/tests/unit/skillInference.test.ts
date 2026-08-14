import { inferSkills } from "../../src/llm/skillInference";
import { getGeminiModel, getGeminiFallbackModel } from "../../src/llm/geminiClient";

jest.mock("../../src/llm/geminiClient", () => ({
  getGeminiModel: jest.fn(),
  getGeminiFallbackModel: jest.fn(),
}));

const mockedGetGeminiModel = getGeminiModel as jest.Mock;
const mockedGetGeminiFallbackModel = getGeminiFallbackModel as jest.Mock;

describe("inferSkills", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("falls back to keyword matching when no model is configured", async () => {
    mockedGetGeminiModel.mockReturnValue(null);
    mockedGetGeminiFallbackModel.mockReturnValue(null);
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

  it("falls back to keyword matching when both models return malformed JSON after retries", async () => {
    mockedGetGeminiModel.mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: { text: () => "not valid json" },
      }),
    });
    mockedGetGeminiFallbackModel.mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: { text: () => "also not valid json" },
      }),
    });
    const skills = await inferSkills("Build the REST API endpoint");
    expect(skills).toEqual(["Backend"]);
  });

  it("retries the primary model once, then falls back to keyword matching when no fallback model is configured", async () => {
    const generateContent = jest.fn().mockRejectedValue(new Error("network error"));
    mockedGetGeminiModel.mockReturnValue({ generateContent });
    mockedGetGeminiFallbackModel.mockReturnValue(null);
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

  it("falls back to the fallback model when the primary model fails after retries", async () => {
    const primaryGenerateContent = jest.fn().mockRejectedValue(new Error("primary down"));
    const fallbackGenerateContent = jest.fn().mockResolvedValue({
      response: { text: () => '["Backend"]' },
    });
    mockedGetGeminiModel.mockReturnValue({ generateContent: primaryGenerateContent });
    mockedGetGeminiFallbackModel.mockReturnValue({ generateContent: fallbackGenerateContent });

    const skills = await inferSkills("Some task");

    expect(skills).toEqual(["Backend"]);
    expect(primaryGenerateContent).toHaveBeenCalledTimes(2);
    expect(fallbackGenerateContent).toHaveBeenCalledTimes(1);
  });

  it("falls back to keyword matching when both primary and fallback models fail after retries", async () => {
    const primaryGenerateContent = jest.fn().mockRejectedValue(new Error("primary down"));
    const fallbackGenerateContent = jest.fn().mockRejectedValue(new Error("fallback down"));
    mockedGetGeminiModel.mockReturnValue({ generateContent: primaryGenerateContent });
    mockedGetGeminiFallbackModel.mockReturnValue({ generateContent: fallbackGenerateContent });

    const skills = await inferSkills("Fix database migration script");

    expect(skills).toEqual(["Backend"]);
    expect(primaryGenerateContent).toHaveBeenCalledTimes(2);
    expect(fallbackGenerateContent).toHaveBeenCalledTimes(2);
  });

  it("uses the fallback model when no primary model is configured", async () => {
    mockedGetGeminiModel.mockReturnValue(null);
    mockedGetGeminiFallbackModel.mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({ response: { text: () => '["Frontend"]' } }),
    });

    const skills = await inferSkills("Some task");
    expect(skills).toEqual(["Frontend"]);
  });
});
