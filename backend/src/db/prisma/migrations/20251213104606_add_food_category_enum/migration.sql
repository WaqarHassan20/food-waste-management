/*
  Warnings:

  - The `category` column on the `food_listings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "FoodCategory" AS ENUM ('PREPARED_FOOD', 'RAW_INGREDIENTS', 'BAKERY', 'DAIRY', 'FRUITS_VEGETABLES', 'BEVERAGES', 'PACKAGED_FOOD', 'FROZEN_FOOD', 'OTHER');

-- AlterTable
ALTER TABLE "food_listings" DROP COLUMN "category",
ADD COLUMN     "category" "FoodCategory" NOT NULL DEFAULT 'OTHER';
