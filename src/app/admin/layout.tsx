import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateDbUser } from "@/lib/user";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import AdminSidebar from "./components/AdminSidebar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect("/dashboard");
  }

  const dbUser = await getOrCreateDbUser(clerkUser);

  if (!dbUser || dbUser.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const userName = dbUser.name || "Admin User";
  const avatarLetter = userName[0]?.toUpperCase() || "A";

  return (
    <div className="flex h-screen bg-background text-foreground font-satoshi">
      {/* Sidebar */}
      <AdminSidebar userName={userName} avatarLetter={avatarLetter} />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-background bg-grid-pattern">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
