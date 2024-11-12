/*
  Warnings:

  - You are about to drop the column `contactId` on the `Chat` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Chat_contactId_key";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "contactId";
