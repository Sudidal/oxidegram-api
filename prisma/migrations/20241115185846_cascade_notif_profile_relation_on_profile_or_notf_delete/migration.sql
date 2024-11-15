-- DropForeignKey
ALTER TABLE "NotificationsOnProfiles" DROP CONSTRAINT "NotificationsOnProfiles_notificationId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationsOnProfiles" DROP CONSTRAINT "NotificationsOnProfiles_profileId_fkey";

-- AddForeignKey
ALTER TABLE "NotificationsOnProfiles" ADD CONSTRAINT "NotificationsOnProfiles_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationsOnProfiles" ADD CONSTRAINT "NotificationsOnProfiles_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
