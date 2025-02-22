import prisma from "./prisma.js";

async function resetDb() {
  await prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.profile.deleteMany(),
    prisma.post.deleteMany(),
    prisma.comment.deleteMany(),
  ]);
}

export { resetDb };
