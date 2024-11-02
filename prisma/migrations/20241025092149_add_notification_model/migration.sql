-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ACTIVITY', 'POST', 'ALERT');

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "url" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_id_key" ON "notification"("id");
