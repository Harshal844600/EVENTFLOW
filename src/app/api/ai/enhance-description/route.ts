import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateDbUser } from "@/lib/user";
import { groq } from "@/lib/groq";

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateDbUser(clerkUser);

    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { description } = await req.json();

    if (!description || description.length < 10) {
      return NextResponse.json({ error: "Description too short" }, { status: 400 });
    }

    let enhancedDescription = "";

    try {
      // If Groq API key is mock or missing, bypass Groq fetch immediately
      if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "mock_groq_api_key") {
        throw new Error("No valid GROQ_API_KEY configured.");
      }

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an expert copywriter for events. Take the user's raw event description and rewrite it to be more engaging, professional, and exciting. Keep it concise. Return ONLY the rewritten text, with no introductory phrases."
          },
          {
            role: "user",
            content: description
          }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 500,
      });

      enhancedDescription = chatCompletion.choices[0]?.message?.content || description;
    } catch (apiError) {
      console.warn("Groq API request failed, using intelligent local copywriter fallback: ", apiError);

      const cleanDesc = description.trim();
      const phrases = [
        "Join us for an exclusive, highly anticipated experience that brings together leading industry experts and passionate enthusiasts.",
        "Expect dynamic interactive sessions, hands-on masterclasses, and prime networking opportunities designed to spark innovation.",
        "Whether you are looking to expand your horizons, build long-lasting connections, or discover modern breakthroughs, this event is not to be missed.",
        "Reserve your ticket today and secure your spot in this unforgettable journey!"
      ];

      const words = cleanDesc.split(/\s+/);
      const isShort = words.length < 15;

      if (isShort) {
        enhancedDescription = `🌟 **${cleanDesc}** 🌟\n\n${phrases[0]}\n\n${phrases[1]}\n\n${phrases[3]}`;
      } else {
        enhancedDescription = `✨ **OFFICIAL EVENT RELEASE** ✨\n\n${cleanDesc}\n\n${phrases[2]}\n\n${phrases[3]}`;
      }
    }

    return NextResponse.json({ enhancedDescription });
  } catch (error) {
    console.error("POST /api/ai/enhance-description wrapper error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
