/*
  Warnings:

  - You are about to drop the column `origin` on the `refpayments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "refpayments" DROP COLUMN "origin";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "subscriptionType" TEXT NOT NULL DEFAULT '';
