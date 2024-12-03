-- CreateTable
CREATE TABLE "_postsSave" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_postsSave_AB_unique" ON "_postsSave"("A", "B");

-- CreateIndex
CREATE INDEX "_postsSave_B_index" ON "_postsSave"("B");

-- AddForeignKey
ALTER TABLE "_postsSave" ADD CONSTRAINT "_postsSave_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_postsSave" ADD CONSTRAINT "_postsSave_B_fkey" FOREIGN KEY ("B") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
