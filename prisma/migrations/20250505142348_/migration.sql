/*
  Warnings:

  - You are about to drop the column `type` on the `WalletMovement` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[actionId]` on the table `WalletMovement` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `actionId` to the `WalletMovement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "ActionType" ADD VALUE 'RESTOCK';

-- AlterTable
ALTER TABLE "WalletMovement" DROP COLUMN "type",
ADD COLUMN     "actionId" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "MovementType";

-- CreateIndex
CREATE UNIQUE INDEX "WalletMovement_actionId_key" ON "WalletMovement"("actionId");

-- AddForeignKey
ALTER TABLE "WalletMovement" ADD CONSTRAINT "WalletMovement_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "UserActions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
