/*
  Warnings:

  - You are about to drop the column `Ammount` on the `WalletMovement` table. All the data in the column will be lost.
  - Added the required column `ammount` to the `WalletMovement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserActions" ADD COLUMN     "reminderSent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "WalletMovement" DROP COLUMN "Ammount",
ADD COLUMN     "ammount" INTEGER NOT NULL;
