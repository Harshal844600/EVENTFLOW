import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateDbUser } from "@/lib/user";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    redirect("/");
  }

  const dbUser = await getOrCreateDbUser(clerkUser);
  if (!dbUser) {
    redirect("/");
  }

  // Pick fields to avoid serialization errors or passing functions
  const serializableUser = {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    bio: dbUser.bio,
    company: dbUser.company,
    jobTitle: dbUser.jobTitle,
    skills: dbUser.skills,
    linkedin: dbUser.linkedin,
    github: dbUser.github,
    website: dbUser.website,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-anton text-4xl uppercase tracking-wide text-foreground">My Profile</h1>
        <p className="text-foreground/60 text-sm mt-1.5 font-medium leading-relaxed">
          Manage your professional details. Your profile will be stored securely and shared on database listings.
        </p>
      </div>
      
      <ProfileForm user={serializableUser} />
    </div>
  );
}
