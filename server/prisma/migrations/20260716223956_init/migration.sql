/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `suppliers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gstin]` on the table `suppliers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ReturnCondition" AS ENUM ('RESELLABLE', 'DAMAGED', 'DEFECTIVE');

-- CreateEnum
CREATE TYPE "CreditNoteStatus" AS ENUM ('ACTIVE', 'REDEEMED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AdjustmentReason" AS ENUM ('PHYSICAL_COUNT', 'DAMAGE', 'EXPIRED', 'LOST', 'CORRECTION');

-- AlterEnum
ALTER TYPE "PaymentMode" ADD VALUE 'STORE_CREDIT';

-- AlterEnum
ALTER TYPE "StockMovementType" ADD VALUE 'OPENING_STOCK';

-- AlterTable
ALTER TABLE "sales_return_items" ADD COLUMN     "condition" "ReturnCondition" NOT NULL DEFAULT 'RESELLABLE';

-- AlterTable
ALTER TABLE "sales_returns" ADD COLUMN     "refundAmount" DECIMAL(12,2),
ADD COLUMN     "refundDate" TIMESTAMP(3),
ADD COLUMN     "refundMethod" "PaymentMode",
ADD COLUMN     "refundProcessedById" UUID;

-- AlterTable
ALTER TABLE "stock_movements" ADD COLUMN     "adjustmentReason" "AdjustmentReason",
ADD COLUMN     "newStock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "previousStock" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'INR',
ADD COLUMN     "financialYear" TEXT,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "ownerName" TEXT,
ADD COLUMN     "panNumber" TEXT,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "suppliers" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "invoice_settings" (
    "id" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "prefix" TEXT NOT NULL DEFAULT 'INV',
    "startingNumber" INTEGER NOT NULL DEFAULT 1,
    "receiptFooter" TEXT,
    "termsAndConditions" TEXT,
    "thankYouMessage" TEXT,
    "a4Template" TEXT,
    "thermal58Template" TEXT,
    "thermal80Template" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gst_settings" (
    "id" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "isGstEnabled" BOOLEAN NOT NULL DEFAULT true,
    "defaultMode" TEXT NOT NULL DEFAULT 'EXCLUSIVE',
    "rate0Enabled" BOOLEAN NOT NULL DEFAULT true,
    "rate5Enabled" BOOLEAN NOT NULL DEFAULT true,
    "rate12Enabled" BOOLEAN NOT NULL DEFAULT true,
    "rate18Enabled" BOOLEAN NOT NULL DEFAULT true,
    "rate28Enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gst_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barcode_settings" (
    "id" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "barcodeType" TEXT NOT NULL DEFAULT 'CODE128',
    "labelWidth" INTEGER NOT NULL DEFAULT 50,
    "labelHeight" INTEGER NOT NULL DEFAULT 30,
    "labelsPerRow" INTEGER NOT NULL DEFAULT 2,
    "showPrice" BOOLEAN NOT NULL DEFAULT true,
    "showSku" BOOLEAN NOT NULL DEFAULT true,
    "showVariant" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barcode_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "printer_settings" (
    "id" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "printerType" TEXT NOT NULL DEFAULT 'thermal',
    "printerName" TEXT,
    "paperSize" TEXT NOT NULL DEFAULT '80mm',
    "margins" INTEGER NOT NULL DEFAULT 5,
    "fontSize" INTEGER NOT NULL DEFAULT 12,
    "autoPrint" BOOLEAN NOT NULL DEFAULT true,
    "copies" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "printer_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "language" TEXT NOT NULL DEFAULT 'en',
    "defaultLandingPage" TEXT NOT NULL DEFAULT '/',
    "defaultPrinter" TEXT,
    "defaultPaymentMethod" TEXT,
    "itemsPerPage" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "recordId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "storeId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "storeId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_settings" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "lowStockAlert" BOOLEAN NOT NULL DEFAULT true,
    "outOfStockAlert" BOOLEAN NOT NULL DEFAULT true,
    "dailySalesSummary" BOOLEAN NOT NULL DEFAULT false,
    "newUserAlert" BOOLEAN NOT NULL DEFAULT true,
    "backupAlert" BOOLEAN NOT NULL DEFAULT true,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT false,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backups" (
    "id" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "filename" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "notes" TEXT,
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "backups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_notes" (
    "id" UUID NOT NULL,
    "creditNoteNumber" TEXT NOT NULL,
    "customerId" UUID,
    "salesReturnId" UUID,
    "originalSaleId" UUID,
    "amount" DECIMAL(12,2) NOT NULL,
    "availableAmount" DECIMAL(12,2) NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "status" "CreditNoteStatus" NOT NULL DEFAULT 'ACTIVE',
    "redeemedAt" TIMESTAMP(3),
    "notes" TEXT,
    "storeId" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "credit_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_note_redemptions" (
    "id" UUID NOT NULL,
    "creditNoteId" UUID NOT NULL,
    "saleId" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_note_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invoice_settings_storeId_key" ON "invoice_settings"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "gst_settings_storeId_key" ON "gst_settings"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "barcode_settings_storeId_key" ON "barcode_settings"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "printer_settings_storeId_key" ON "printer_settings"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_module_idx" ON "audit_logs"("module");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_storeId_idx" ON "audit_logs"("storeId");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_userId_key" ON "notification_settings"("userId");

-- CreateIndex
CREATE INDEX "backups_storeId_idx" ON "backups"("storeId");

-- CreateIndex
CREATE INDEX "backups_createdAt_idx" ON "backups"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "credit_notes_creditNoteNumber_key" ON "credit_notes"("creditNoteNumber");

-- CreateIndex
CREATE INDEX "credit_notes_creditNoteNumber_idx" ON "credit_notes"("creditNoteNumber");

-- CreateIndex
CREATE INDEX "credit_notes_customerId_idx" ON "credit_notes"("customerId");

-- CreateIndex
CREATE INDEX "credit_notes_status_idx" ON "credit_notes"("status");

-- CreateIndex
CREATE INDEX "credit_note_redemptions_creditNoteId_idx" ON "credit_note_redemptions"("creditNoteId");

-- CreateIndex
CREATE INDEX "credit_note_redemptions_saleId_idx" ON "credit_note_redemptions"("saleId");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_phone_key" ON "suppliers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_gstin_key" ON "suppliers"("gstin");

-- AddForeignKey
ALTER TABLE "invoice_settings" ADD CONSTRAINT "invoice_settings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gst_settings" ADD CONSTRAINT "gst_settings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barcode_settings" ADD CONSTRAINT "barcode_settings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "printer_settings" ADD CONSTRAINT "printer_settings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backups" ADD CONSTRAINT "backups_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backups" ADD CONSTRAINT "backups_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_returns" ADD CONSTRAINT "sales_returns_refundProcessedById_fkey" FOREIGN KEY ("refundProcessedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_salesReturnId_fkey" FOREIGN KEY ("salesReturnId") REFERENCES "sales_returns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_originalSaleId_fkey" FOREIGN KEY ("originalSaleId") REFERENCES "sales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_note_redemptions" ADD CONSTRAINT "credit_note_redemptions_creditNoteId_fkey" FOREIGN KEY ("creditNoteId") REFERENCES "credit_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_note_redemptions" ADD CONSTRAINT "credit_note_redemptions_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
