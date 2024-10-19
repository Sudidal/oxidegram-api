-- CreateTable
CREATE TABLE "_PostLike" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_CommentLike" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PostLike_AB_unique" ON "_PostLike"("A", "B");

-- CreateIndex
CREATE INDEX "_PostLike_B_index" ON "_PostLike"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CommentLike_AB_unique" ON "_CommentLike"("A", "B");

-- CreateIndex
CREATE INDEX "_CommentLike_B_index" ON "_CommentLike"("B");

-- AddForeignKey
ALTER TABLE "_PostLike" ADD CONSTRAINT "_PostLike_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostLike" ADD CONSTRAINT "_PostLike_B_fkey" FOREIGN KEY ("B") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommentLike" ADD CONSTRAINT "_CommentLike_A_fkey" FOREIGN KEY ("A") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommentLike" ADD CONSTRAINT "_CommentLike_B_fkey" FOREIGN KEY ("B") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
