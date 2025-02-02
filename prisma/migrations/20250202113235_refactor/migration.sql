/*
  Warnings:

  - You are about to drop the column `isPaid` on the `payments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payments" DROP COLUMN "isPaid",
ADD COLUMN     "paid" BOOLEAN NOT NULL DEFAULT false;
