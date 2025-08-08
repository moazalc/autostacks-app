/*
  Warnings:

  - You are about to drop the column `name` on the `Car` table. All the data in the column will be lost.
  - Added the required column `make` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Car` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Car" DROP COLUMN "name",
ADD COLUMN     "imgUrl" TEXT,
ADD COLUMN     "make" TEXT NOT NULL,
ADD COLUMN     "model" TEXT NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;
