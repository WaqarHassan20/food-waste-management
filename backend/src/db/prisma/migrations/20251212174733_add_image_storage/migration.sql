/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `food_listings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "food_listings" DROP COLUMN "imageUrl",
ADD COLUMN     "imageData" BYTEA,
ADD COLUMN     "imageMimeType" TEXT;
