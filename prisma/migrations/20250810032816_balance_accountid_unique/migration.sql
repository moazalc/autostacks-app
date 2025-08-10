/*
  Warnings:

  - A unique constraint covering the columns `[accountId]` on the table `Balance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Balance_accountId_key" ON "public"."Balance"("accountId");
