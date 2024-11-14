import prisma from "./prisma.js";
import asyncHandler from "./asyncHandler.js";

async function createContact(profileId, contactedId) {
  const [result, err] = await asyncHandler.prismaQuery(() =>
    prisma.contact.create({
      data: {
        profile: {
          connect: { id: profileId },
        },
        contacted: {
          connect: { id: contactedId },
        },
        chat: {
          create: {},
        },
      },
    })
  );

  console.log(err);
}

export default createContact;
