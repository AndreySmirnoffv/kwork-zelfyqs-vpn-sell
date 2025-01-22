-- AlterTable
ALTER TABLE "users" ADD COLUMN     "refBalance" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "subStatus" BOOLEAN NOT NULL DEFAULT false;
