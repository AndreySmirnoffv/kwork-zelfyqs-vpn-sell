-- CreateTable
CREATE TABLE "refpayments" (
    "id" BIGSERIAL NOT NULL,
    "amount" BIGINT NOT NULL,
    "userId" BIGINT NOT NULL,
    "origin" BIGINT NOT NULL,

    CONSTRAINT "refpayments_pkey" PRIMARY KEY ("id")
);
