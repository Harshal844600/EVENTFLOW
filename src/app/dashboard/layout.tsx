import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateDbUser } from "@/lib/user";
import { redirect } from "next/navigation";
import DashboardSidebar from "./components/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    redirect("/");
  }

  const dbUser = await getOrCreateDbUser(clerkUser);
  if (!dbUser) {
    redirect("/");
  }

  const userName = dbUser.name || "User";
  const avatarLetter = userName[0]?.toUpperCase() || "U";

  return (
    <div className="pt-20 min-h-screen bg-grid-pattern bg-background flex flex-col justify-between transition-theme">
      <div className="flex-1">
        <Navbar />
        <main className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <DashboardSidebar userName={userName} avatarLetter={avatarLetter} email={dbUser.email} />
            <div className="flex-1 min-w-0 w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
