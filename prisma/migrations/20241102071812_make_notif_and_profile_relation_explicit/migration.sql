/*
  Warnings:

  - You are about to drop the `_NotificationToProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_NotificationToProfile" DROP CONSTRAINT "_NotificationToProfile_A_fkey";

-- DropForeignKey
ALTER TABLE "_NotificationToProfile" DROP CONSTRAINT "_NotificationToProfile_B_fkey";

-- DropTable
DROP TABLE "_NotificationToProfile";

-- CreateTable
CREATE TABLE "NotificationsOnProfiles" (
    "notificationId" INTEGER NOT NULL,
    "profileId" INTEGER NOT NULL,
    "seen" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "NotificationsOnProfiles_pkey" PRIMARY KEY ("notificationId","profileId")
);

-- AddForeignKey
ALTER TABLE "NotificationsOnProfiles" ADD CONSTRAINT "NotificationsOnProfiles_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationsOnProfiles" ADD CONSTRAINT "NotificationsOnProfiles_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
