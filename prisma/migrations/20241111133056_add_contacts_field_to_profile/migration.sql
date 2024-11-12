-- CreateTable
CREATE TABLE "_contact" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_contact_AB_unique" ON "_contact"("A", "B");

-- CreateIndex
CREATE INDEX "_contact_B_index" ON "_contact"("B");

-- AddForeignKey
ALTER TABLE "_contact" ADD CONSTRAINT "_contact_A_fkey" FOREIGN KEY ("A") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_contact" ADD CONSTRAINT "_contact_B_fkey" FOREIGN KEY ("B") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
