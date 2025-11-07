-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingCountry" TEXT NOT NULL DEFAULT 'Indonesia';

-- AlterTable
ALTER TABLE "ShippingAddress" ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'Indonesia';
