import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateDbUser } from "@/lib/user";

export async function PUT(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateDbUser(clerkUser);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = await req.json();

    // Validate and parse age
    let validAge: number | null = null;
    if (data.age !== undefined && data.age !== null && data.age !== "") {
      const parsedAge = parseInt(String(data.age), 10);
      if (!isNaN(parsedAge) && parsedAge >= 10 && parsedAge <= 120) {
        validAge = parsedAge;
      }
    }

    // Validate gender
    let validGender: string | null = null;
    if (typeof data.gender === "string" && data.gender.trim()) {
      validGender = data.gender.trim();
    }

    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        age: data.age !== undefined ? validAge : undefined,
        gender: data.gender !== undefined ? validGender : undefined,
        bio: data.bio !== undefined ? data.bio : null,
        company: data.company !== undefined ? data.company : null,
        jobTitle: data.jobTitle !== undefined ? data.jobTitle : null,
        skills: data.skills !== undefined ? data.skills : null,
        linkedin: data.linkedin !== undefined ? data.linkedin : null,
        github: data.github !== undefined ? data.github : null,
        website: data.website !== undefined ? data.website : null,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("PUT /api/user/profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
