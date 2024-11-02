-- DropIndex
DROP INDEX "notification_id_key";

-- AlterTable
ALTER TABLE "notification" ADD CONSTRAINT "notification_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "_ProfileTonotification" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProfileTonotification_AB_unique" ON "_ProfileTonotification"("A", "B");

-- CreateIndex
CREATE INDEX "_ProfileTonotification_B_index" ON "_ProfileTonotification"("B");

-- AddForeignKey
ALTER TABLE "_ProfileTonotification" ADD CONSTRAINT "_ProfileTonotification_A_fkey" FOREIGN KEY ("A") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfileTonotification" ADD CONSTRAINT "_ProfileTonotification_B_fkey" FOREIGN KEY ("B") REFERENCES "notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
