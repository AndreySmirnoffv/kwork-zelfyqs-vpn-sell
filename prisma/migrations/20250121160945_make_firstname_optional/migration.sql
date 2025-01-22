/*
  Warnings:

  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "userId" BIGINT NOT NULL;

-- DropTable
DROP TABLE "user";

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "firstname" TEXT,
    "lastname" TEXT NOT NULL,
    "chatId" BIGINT NOT NULL,
    "balance" BIGINT NOT NULL DEFAULT 0,
    "isAdmin" BOOLEAN NOT NULL,
    "ref" TEXT NOT NULL,
    "origin" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
