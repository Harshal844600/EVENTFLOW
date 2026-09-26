import { test, describe } from "node:test";
import assert from "node:assert";

describe("AI Prompt & Style Engineering", () => {
  const STYLE_PROFILES: Record<string, string> = {
    cinematic: "award-winning cinematic photography, 35mm lens, f/1.8, dramatic volumetric studio lighting, rich depth of field",
    cyberpunk: "futuristic cyberpunk neon glow, dark charcoal background, holographic wireframes",
    minimalist3d: "modern minimalist 3D frosted glassmorphism, floating geometric spheres, clean Apple keynote aesthetic",
    festival: "monumental concert festival stage, radiant laser beams cutting through atmospheric haze",
    editorial: "luxury architectural space, sleek modernist concrete and glass, dramatic minimalist geometry",
  };

  test("generates style-tailored prompt with negative constraints", () => {
    const title = "Global Tech Summit 2026";
    const category = "Technology";
    const style = "cyberpunk";

    const negativeConstraints = "no text, no letters, no words, no watermark, no logos, no blurry, no low quality";
    const prompt = `${title} ${category}, ${STYLE_PROFILES[style]}, 16:9 banner composition, ${negativeConstraints}`;

    assert.ok(prompt.includes("cyberpunk neon glow"));
    assert.ok(prompt.includes("no text"));
    assert.ok(prompt.includes("16:9"));
  });

  test("strips <think> tags from LLM outputs cleanly", () => {
    const rawOutput = "<think>Let me think about how to write this description</think>### Global AI Summit 2026\n\nExperience tomorrow.";
    const cleaned = rawOutput.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    assert.strictEqual(cleaned, "### Global AI Summit 2026\n\nExperience tomorrow.");
  });

  test("falls back to default cinematic style when style is unknown", () => {
    const requested = "unknown_style";
    const resolved = STYLE_PROFILES[requested] || STYLE_PROFILES.cinematic;
    assert.ok(resolved.includes("cinematic photography"));
  });
});
