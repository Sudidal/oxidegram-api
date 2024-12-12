/*
  Warnings:

  - Added the required column `fileType` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('IMAGE', 'VIDEO');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "fileType" "FileType" NOT NULL;
