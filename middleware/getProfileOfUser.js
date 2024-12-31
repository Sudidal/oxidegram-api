import asyncHandler from "../utils/asyncHandler.js";
import prisma from "../utils/prisma.js";

async function getProfileOfUser(userId) {
  if (typeof userId !== "number") return null;

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
