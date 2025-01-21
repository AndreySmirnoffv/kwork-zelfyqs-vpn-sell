/*
  Warnings:

  - Added the required column `origin` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ref` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "origin" TEXT NOT NULL,
ADD COLUMN     "ref" TEXT NOT NULL;
