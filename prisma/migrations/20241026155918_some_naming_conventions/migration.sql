/*
  Warnings:

  - You are about to drop the `_ProfileTonotification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_follow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProfileTonotification" DROP CONSTRAINT "_ProfileTonotification_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProfileTonotification" DROP CONSTRAINT "_ProfileTonotification_B_fkey";

-- DropForeignKey
ALTER TABLE "_follow" DROP CONSTRAINT "_follow_A_fkey";

-- DropForeignKey
ALTER TABLE "_follow" DROP CONSTRAINT "_follow_B_fkey";

-- DropTable
DROP TABLE "_ProfileTonotification";

-- DropTable
DROP TABLE "_follow";

-- DropTable
DROP TABLE "notification";

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "url" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "__FollowedToFollower" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_NotificationToProfile" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "__FollowedToFollower_AB_unique" ON "__FollowedToFollower"("A", "B");

-- CreateIndex
CREATE INDEX "__FollowedToFollower_B_index" ON "__FollowedToFollower"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_NotificationToProfile_AB_unique" ON "_NotificationToProfile"("A", "B");

-- CreateIndex
CREATE INDEX "_NotificationToProfile_B_index" ON "_NotificationToProfile"("B");

-- AddForeignKey
ALTER TABLE "__FollowedToFollower" ADD CONSTRAINT "__FollowedToFollower_A_fkey" FOREIGN KEY ("A") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__FollowedToFollower" ADD CONSTRAINT "__FollowedToFollower_B_fkey" FOREIGN KEY ("B") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NotificationToProfile" ADD CONSTRAINT "_NotificationToProfile_A_fkey" FOREIGN KEY ("A") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NotificationToProfile" ADD CONSTRAINT "_NotificationToProfile_B_fkey" FOREIGN KEY ("B") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
