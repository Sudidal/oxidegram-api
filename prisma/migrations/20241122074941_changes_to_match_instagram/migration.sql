/*
  Warnings:

  - You are about to drop the column `country` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Profile` table. All the data in the column will be lost.
  - You are about to alter the column `bio` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - You are about to alter the column `username` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - Added the required column `fullName` to the `Profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "country",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "fullName" VARCHAR(100) NOT NULL,
ALTER COLUMN "bio" SET DATA TYPE VARCHAR(150),
ALTER COLUMN "gender" DROP NOT NULL,
ALTER COLUMN "username" SET DATA TYPE VARCHAR(100);
