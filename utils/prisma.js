import { PrismaClient } from "@prisma/client";
import { pushNotifToFollowersFunc } from "@prisma/client/sql";

const prisma = new PrismaClient();

await prisma.$queryRawTyped(pushNotifToFollowersFunc());

export default prisma;
