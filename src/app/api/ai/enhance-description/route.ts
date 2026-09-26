import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateDbUser } from "@/lib/user";
import { groq } from "@/lib/groq";
import { rateLimit, getClientIp } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

const SYSTEM_PROMPT = `You are a world-class event strategist, brand storyteller, and conversion copywriter.
Your goal is to transform the provided event notes into a compelling, high-converting, and professionally formatted event description.

### Instructions:
1. Write 100% original copy customized specifically to the event title, category, venue, and organizer notes provided.
2. Structure the description logically using clean Markdown:
   - An attention-grabbing hook and visionary overview
   - ### ✨ Key Highlights & Experiences (detailed bullet points)
   - ### 🎯 Who Should Attend (tailored audience personas)
   - ### 🎟️ Why You Can't Miss This (strong call to action)
3. Adapt your vocabulary and energy to the event type:
   - Tech/Developer: visionary, deep-tech, practical innovation, breakthrough.
   - Music/Entertainment: sensory, electrifying, atmospheric, unforgettable.
   - Business/Networking: high-impact, executive, strategic partnerships.
   - Workshops: actionable, hands-on, career-accelerating.
4. CRITICAL CONSTRAINT: Output ONLY the finished event description in Markdown. Do NOT include any prefaces, conversational greetings, explanations, or thinking tags.`;

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting Protection
    const clientIp = getClientIp(req);
    const limitCheck = rateLimit(`ai-copy:${clientIp}`, { limit: 20, windowMs: 60_000 });
    if (!limitCheck.success) {
      return NextResponse.json(
        { error: "Rate limit reached. Please wait a moment before trying again." },
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

    const { description, title, category, venue, tone } = await req.json();

    if (!description || description.trim().length < 5) {
      return NextResponse.json(
        { error: "Please enter a few draft thoughts or keywords first." },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "mock_groq_api_key") {
      return NextResponse.json(
        { error: "GROQ_API_KEY is missing or invalid in server configuration." },
        { status: 500 }
      );
    }

    const userPrompt = `Create a high-converting event description based on these details:
- Title: ${title || "Untitled Event"}
- Category: ${category || "General"}
- Venue / Location: ${venue || "To be announced"}
${tone ? `- Tone: ${tone}` : ""}
- Organizer's Raw Notes: "${description.trim()}"`;

    let generatedCopy = "";
    let usedModel = "";

    // Candidate models on Groq
    const models = [
      { id: "openai/gpt-oss-120b", maxTokens: 1000 },
      { id: "allam-2-7b", maxTokens: 800 },
      { id: "openai/gpt-oss-20b", maxTokens: 800 },
    ];

    for (const modelConfig of models) {
      try {
        const response = await groq.chat.completions.create({
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          model: modelConfig.id,
          temperature: 0.75,
          max_tokens: modelConfig.maxTokens,
        });

        const raw = response.choices[0]?.message?.content || "";
        // Clean out any <think> tags or prefaces
        const cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

        if (cleaned.length > 50) {
          generatedCopy = cleaned;
          usedModel = modelConfig.id;
          break;
        }
      } catch (err: any) {
        logger.warn(`Model ${modelConfig.id} failed, trying next candidate:`, { error: err.message });
      }
    }

    if (!generatedCopy) {
      return NextResponse.json(
        { error: "AI model was unable to generate copy at this time. Please retry." },
        { status: 503 }
      );
    }

    logger.info("Real AI description generated successfully", { model: usedModel, title });

    return NextResponse.json({
      enhancedDescription: generatedCopy,
      model: usedModel,
    });
  } catch (error: any) {
    logger.error("POST /api/ai/enhance-description error", error);
    return NextResponse.json({ error: error.message || "Failed to enhance description" }, { status: 500 });
  }
}
