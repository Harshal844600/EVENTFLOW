import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateDbUser } from "@/lib/user";
import UserMenu from "./UserMenu";
import { NavbarClient } from "./NavbarClient";

export default async function Navbar() {
  const clerkUser = await currentUser();
  let isAdmin = false;

  if (clerkUser) {
    const dbUser = await getOrCreateDbUser(clerkUser);
    isAdmin = dbUser?.role === "ADMIN";
  }

  return (
    <NavbarClient
      isAdmin={isAdmin}
      hasUser={!!clerkUser}
      userMenuNode={clerkUser ? <UserMenu /> : undefined}
    />
  );
}
