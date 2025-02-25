import asyncHandler from "../utils/asyncHandler.ts";
import prisma from "../utils/prisma.ts";

async function getProfileOfUser(userId: number) {
  const [profile, err] = await asyncHandler.prismaQuery(() =>
    prisma.profile.findFirst({
      where: {
        userId: userId,
      },
    })
  );

  if (err) {
    console.error(err);
  }

  return profile;
}

export default getProfileOfUser;
