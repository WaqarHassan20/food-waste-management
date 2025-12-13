/*
  Warnings:

  - You are about to drop the column `userId` on the `restaurants` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `restaurants` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `restaurants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `restaurants` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "restaurants" DROP CONSTRAINT "restaurants_userId_fkey";

-- DropIndex
DROP INDEX "restaurants_userId_key";

-- AlterTable
ALTER TABLE "restaurants" DROP COLUMN "userId",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "restaurants_email_key" ON "restaurants"("email");
