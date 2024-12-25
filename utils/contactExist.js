import prisma from "./prisma.js";
import asyncHandler from "./asyncHandler.js";

async function contactExist(profileId, contactedId) {
  const [result, err] = await asyncHandler.prismaQuery(() =>
    prisma.contact.findFirst({
      where: {
        profileId: profileId,
        contactedId: contactedId,
      },
    })
  );

  if (!result) {
    return false;
  }
  return true;
}

export { contactExist };
