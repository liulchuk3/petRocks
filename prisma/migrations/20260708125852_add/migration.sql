/*
  Warnings:

  - Added the required column `cityName` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cityRef` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `warehouseName` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `warehouseRef` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cityName" TEXT NOT NULL,
ADD COLUMN     "cityRef" TEXT NOT NULL,
ADD COLUMN     "novaPoshtaRef" TEXT,
ADD COLUMN     "trackingNumber" TEXT,
ADD COLUMN     "warehouseName" TEXT NOT NULL,
ADD COLUMN     "warehouseRef" TEXT NOT NULL;
