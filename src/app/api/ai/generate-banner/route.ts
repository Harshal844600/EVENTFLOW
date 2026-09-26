import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateDbUser } from "@/lib/user";
import { groq } from "@/lib/groq";
import { rateLimit, getClientIp } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

const PROMPT_ENGINEER_SYSTEM = `You are an elite AI Art Director and Prompt Engineer specializing in Midjourney and Flux image generation for event promotional banners.

Your task: Given an event's title, category, and theme, generate a single, highly evocative photographic or 3D scene description (40 to 60 words).

Rules:
1. Describe the physical scene: environment, key objects, architecture, perspective, and composition.
2. Specify lighting and atmosphere: e.g., volumetric god rays, neon rim lighting, atmospheric fog, dusk golden hour.
3. Specify camera & rendering details: e.g., 35mm photograph, wide-angle lens, cinematic depth of field, 8k resolution, octane render.
4. STRICT NEGATIVE CONSTRAINTS: Do NOT include any text, letters, words, logos, or watermarks in the visual scene description.
5. Return ONLY the raw visual prompt text with no quotation marks, no explanations, and no thinking tags.`;

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting Protection
    const clientIp = getClientIp(req);
    const limitCheck = rateLimit(`ai-banner:${clientIp}`, { limit: 20, windowMs: 60_000 });
    if (!limitCheck.success) {
      return NextResponse.json(
        { error: "Too many banner requests. Please wait a moment." },
        { status: 429 }
      );
    }

    // 2. Auth & RBAC
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateDbUser(clerkUser);
    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const { title, category, description, style = "cinematic" } = await req.json();

    if (!title || title.trim().length < 2) {
      return NextResponse.json({ error: "Event title is required to generate a banner" }, { status: 400 });
    }

    let aiGeneratedPrompt = "";
    let usedModel = "";

    // 3. Leverage the real AI model to craft a custom scene prompt
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "mock_groq_api_key") {
      const userPrompt = `Create a Flux event banner scene for:
- Event Title: "${title}"
- Category: "${category || "Live Event"}"
- Style Aesthetic: "${style}"
- Event Concept: "${(description || "").substring(0, 100)}"`;

      const candidateModels = [
        { id: "openai/gpt-oss-120b", maxTokens: 600 },
        { id: "allam-2-7b", maxTokens: 300 },
      ];

      for (const m of candidateModels) {
        try {
          const response = await groq.chat.completions.create({
            messages: [
              { role: "system", content: PROMPT_ENGINEER_SYSTEM },
              { role: "user", content: userPrompt },
            ],
            model: m.id,
            temperature: 0.8,
            max_tokens: m.maxTokens,
          });

          const raw = response.choices[0]?.message?.content || "";
          const clean = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").replace(/["\n\r]/g, " ").trim();

          if (clean.length > 20) {
            aiGeneratedPrompt = clean;
            usedModel = m.id;
            break;
          }
        } catch (err: any) {
          logger.warn(`AI Prompt generator ${m.id} failed, attempting next`, { error: err.message });
        }
      }
    }

    // 4. If AI prompt generation could not connect, generate a dynamic context prompt
    if (!aiGeneratedPrompt) {
      aiGeneratedPrompt = `Cinematic wide-angle shot of a grand ${category || "event"} arena celebrating ${title}, dramatic volumetric atmospheric lighting, photorealistic, 8k resolution, octane render`;
    }

    // 5. Append negative prompt safeguards for clean banner output
    const negativeConstraints = "no text, no typography, no letters, no watermark, no logo, no blurry artifacts, no low resolution";
    const finalFluxPrompt = `${aiGeneratedPrompt}, 16:9 banner composition, ${negativeConstraints}`;

    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalFluxPrompt)}?width=1200&height=630&model=flux&nologo=true&enhance=true&seed=${seed}`;

    logger.info("Real AI banner generated", { title, model: usedModel, seed });

    return NextResponse.json({
      imageUrl,
      aiPrompt: aiGeneratedPrompt,
      model: usedModel,
      seed,
    });
  } catch (error: any) {
    logger.error("POST /api/ai/generate-banner error", error);
    return NextResponse.json({ error: error.message || "Failed to generate banner" }, { status: 500 });
  }
}
