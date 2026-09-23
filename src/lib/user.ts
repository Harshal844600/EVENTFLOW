import { prisma } from "./prisma";

export async function getOrCreateDbUser(clerkUser: any) {
  if (!clerkUser) return null;
  
  const email = clerkUser.emailAddresses?.[0]?.emailAddress;
  if (!email) return null;

  let dbUser = await prisma.user.findUnique({ where: { email } });
  
  const expectedName = clerkUser.fullName || clerkUser.firstName || "User";
  const expectedAvatar = clerkUser.imageUrl;

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        email,
        name: expectedName,
        avatarUrl: expectedAvatar,
      },
    });
  } else {
    // Sync name and avatar if they are updated in Clerk
    const updatedData: any = {};
    if (dbUser.name !== expectedName) {
      updatedData.name = expectedName;
    }
    if (expectedAvatar && dbUser.avatarUrl !== expectedAvatar) {
      updatedData.avatarUrl = expectedAvatar;
    }
    if (Object.keys(updatedData).length > 0) {
      dbUser = await prisma.user.update({
        where: { email },
        data: updatedData,
      });
    }
  }
  return dbUser;
}
