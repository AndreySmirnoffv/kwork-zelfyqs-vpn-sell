/*
  Warnings:

  - You are about to drop the column `currentSubCount` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `paidCard` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `subStatus` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionEnd` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionType` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "currentSubCount",
DROP COLUMN "paidCard",
DROP COLUMN "subStatus",
DROP COLUMN "subscriptionEnd",
DROP COLUMN "subscriptionType";

-- CreateTable
CREATE TABLE "subscription" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL DEFAULT '',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
