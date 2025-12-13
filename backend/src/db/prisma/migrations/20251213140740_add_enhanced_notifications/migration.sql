/*
  Warnings:

  - Changed the type of `type` on the `notifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REQUEST_CREATED', 'REQUEST_APPROVED', 'REQUEST_REJECTED', 'REQUEST_CANCELLED', 'REQUEST_COMPLETED', 'NEW_FOOD_AVAILABLE', 'LISTING_EXPIRING_SOON', 'RESTAURANT_VERIFIED', 'USER_VERIFIED', 'SYSTEM_ANNOUNCEMENT');

-- AlterTable - Add new columns first
ALTER TABLE "notifications" ADD COLUMN "actionUrl" TEXT;
ALTER TABLE "notifications" ADD COLUMN "metadata" JSONB;

-- Add temporary column for new type
ALTER TABLE "notifications" ADD COLUMN "type_new" "NotificationType";

-- Migrate existing data with mappings
UPDATE "notifications" SET "type_new" = 
  CASE 
    WHEN "type" LIKE '%approved%' THEN 'REQUEST_APPROVED'::"NotificationType"
    WHEN "type" LIKE '%rejected%' THEN 'REQUEST_REJECTED'::"NotificationType"
    WHEN "type" LIKE '%cancelled%' THEN 'REQUEST_CANCELLED'::"NotificationType"
    WHEN "type" LIKE '%completed%' THEN 'REQUEST_COMPLETED'::"NotificationType"
    WHEN "type" LIKE '%request%' THEN 'REQUEST_CREATED'::"NotificationType"
    WHEN "type" LIKE '%food%' THEN 'NEW_FOOD_AVAILABLE'::"NotificationType"
    ELSE 'SYSTEM_ANNOUNCEMENT'::"NotificationType"
  END;

-- Drop old column and rename new one
ALTER TABLE "notifications" DROP COLUMN "type";
ALTER TABLE "notifications" RENAME COLUMN "type_new" TO "type";
ALTER TABLE "notifications" ALTER COLUMN "type" SET NOT NULL;

-- CreateTable
CREATE TABLE "restaurant_notifications" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "type" "NotificationType" NOT NULL,
    "metadata" JSONB,
    "actionUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restaurant_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "restaurant_notifications_restaurantId_isRead_idx" ON "restaurant_notifications"("restaurantId", "isRead");

-- CreateIndex
CREATE INDEX "restaurant_notifications_restaurantId_createdAt_idx" ON "restaurant_notifications"("restaurantId", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "restaurant_notifications" ADD CONSTRAINT "restaurant_notifications_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
