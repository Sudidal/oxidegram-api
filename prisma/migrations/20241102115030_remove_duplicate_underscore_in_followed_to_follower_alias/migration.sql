/*
  Warnings:

  - You are about to drop the `__FollowedToFollower` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "__FollowedToFollower" DROP CONSTRAINT "__FollowedToFollower_A_fkey";

-- DropForeignKey
ALTER TABLE "__FollowedToFollower" DROP CONSTRAINT "__FollowedToFollower_B_fkey";

-- DropTable
DROP TABLE "__FollowedToFollower";

-- CreateTable
CREATE TABLE "_FollowedToFollower" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_FollowedToFollower_AB_unique" ON "_FollowedToFollower"("A", "B");

-- CreateIndex
CREATE INDEX "_FollowedToFollower_B_index" ON "_FollowedToFollower"("B");

-- AddForeignKey
ALTER TABLE "_FollowedToFollower" ADD CONSTRAINT "_FollowedToFollower_A_fkey" FOREIGN KEY ("A") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FollowedToFollower" ADD CONSTRAINT "_FollowedToFollower_B_fkey" FOREIGN KEY ("B") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
