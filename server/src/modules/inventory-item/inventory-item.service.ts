import path from 'path';
import fs from 'fs/promises';
import prisma from '../../utils/prisma';
import { AppError } from '../../middleware/errorHandler';
import type { InventoryItemStatus } from '@prisma/client';

const bwipjs = require('bwip-js');
const BARCODE_DIR = path.resolve(__dirname, '../../../uploads/barcodes/items');

function ensureDir(dir: string) {
  return fs.mkdir(dir, { recursive: true });
}

function generateUniqueBarcodeValue(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `I${ts}${rand}`.slice(0, 16);
}

async function generateUniqueBarcode(): Promise<string> {
  let barcode = generateUniqueBarcodeValue();
  let attempts = 0;
  while (await prisma.inventoryItem.findUnique({ where: { barcode } })) {
    barcode = generateUniqueBarcodeValue();
    attempts++;
    if (attempts > 20) {
      barcode = `I${Date.now()}${Math.random().toString().slice(2, 6)}`.slice(0, 16);
      break;
    }
  }
  return barcode;
}

async function generateBarcodeImage(
  barcodeValue: string,
  variantId: string,
  index: number,
): Promise<string> {
  await ensureDir(BARCODE_DIR);
  const filename = `item-${variantId}-${index}.png`;
  const filePath = path.join(BARCODE_DIR, filename);

  const png = await bwipjs.toBuffer({
    bcid: 'code128',
    text: barcodeValue,
    scale: 3,
    height: 10,
    includetext: true,
    textxalign: 'center',
  });

  await fs.writeFile(filePath, png);
  return `/uploads/barcodes/items/${filename}`;
}

export const inventoryItemService = {
  async batchCreate(data: {
    variantId: string;
    quantity: number;
    serialNumbers?: string[];
    storeId: string;
    createdById: string;
  }) {
    const variant = await prisma.productVariant.findFirst({
      where: { id: data.variantId, deletedAt: null, isActive: true },
      include: { product: { select: { name: true } } },
    });
    if (!variant) throw new AppError('Variant not found', 404);
    if (data.quantity < 1) throw new AppError('Quantity must be at least 1', 400);

    const items: Array<{
      barcode: string;
      variantId: string;
      storeId: string;
      serialNumber: string | null;
      status: InventoryItemStatus;
      barcodeImagePath: string;
    }> = [];

    const barcodeSet = new Set<string>();

    for (let i = 0; i < data.quantity; i++) {
      let barcode = await generateUniqueBarcode();
      while (barcodeSet.has(barcode)) {
        barcode = await generateUniqueBarcode();
      }
      barcodeSet.add(barcode);

      const imagePath = await generateBarcodeImage(barcode, data.variantId, i + 1);

      items.push({
        barcode,
        variantId: data.variantId,
        storeId: data.storeId,
        serialNumber: data.serialNumbers?.[i] || null,
        status: 'AVAILABLE',
        barcodeImagePath: imagePath,
      });
    }

    const created = await prisma.$transaction(async (tx) => {
      const records = await tx.inventoryItem.createMany({ data: items });

      await tx.productVariant.update({
        where: { id: data.variantId },
        data: { stockQuantity: { increment: data.quantity } },
      });

      await tx.stockMovement.create({
        data: {
          productVariantId: data.variantId,
          quantity: data.quantity,
          type: 'PURCHASE',
          previousStock: variant.stockQuantity,
          newStock: variant.stockQuantity + data.quantity,
          storeId: data.storeId,
          createdById: data.createdById,
          notes: `Added ${data.quantity} inventory items with unique barcodes`,
        },
      });

      return records;
    });

    return {
      count: created.count,
      barcodes: items.map((i) => ({ barcode: i.barcode, imagePath: i.barcodeImagePath })),
    };
  },

  async lookupByBarcode(barcode: string) {
    const item = await prisma.inventoryItem.findUnique({
      where: { barcode },
      include: {
        productVariant: {
          include: {
            product: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
    if (!item) throw new AppError('No item found for this barcode', 404);
    return item;
  },

  async list(filters: {
    variantId?: string;
    status?: InventoryItemStatus;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 200);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.variantId) where.variantId = filters.variantId;
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { barcode: { contains: filters.search, mode: 'insensitive' } },
        { serialNumber: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          productVariant: {
            select: {
              id: true,
              sku: true,
              size: true,
              color: true,
              fabric: true,
              sellingPrice: true,
            },
          },
        },
      }),
      prisma.inventoryItem.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async updateStatus(id: string, status: InventoryItemStatus, userId: string, reason?: string) {
    const item = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) throw new AppError('Inventory item not found', 404);

    const variant = await prisma.productVariant.findUnique({ where: { id: item.variantId } });
    if (!variant) throw new AppError('Variant not found', 404);

    return prisma.$transaction(async (tx) => {
      const oldStatus = item.status;
      const updated = await tx.inventoryItem.update({
        where: { id },
        data: {
          status,
          returnedAt:
            status === 'RETURNED' ? new Date() : status === 'AVAILABLE' ? null : undefined,
          returnReason: reason || null,
        },
      });

      let stockDelta = 0;
      if (oldStatus === 'AVAILABLE' && status !== 'AVAILABLE') stockDelta = -1;
      else if (oldStatus !== 'AVAILABLE' && status === 'AVAILABLE') stockDelta = 1;

      if (stockDelta !== 0) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { increment: stockDelta } },
        });
        await tx.stockMovement.create({
          data: {
            productVariantId: item.variantId,
            quantity: stockDelta,
            type: stockDelta > 0 ? 'RETURN' : 'ADJUSTMENT',
            previousStock: variant.stockQuantity,
            newStock: variant.stockQuantity + stockDelta,
            storeId: item.storeId,
            createdById: userId,
            notes: reason || `Status changed from ${oldStatus} to ${status}`,
          },
        });
      }

      return updated;
    });
  },

  async markAsSold(items: Array<{ inventoryItemId: string }>, saleId: string, saleItemId: string) {
    const ids = items.map((i) => i.inventoryItemId);
    const records = await prisma.inventoryItem.findMany({
      where: { id: { in: ids }, status: 'AVAILABLE' },
    });

    if (records.length !== ids.length) {
      const found = new Set(records.map((r) => r.id));
      const missing = ids.filter((id) => !found.has(id));
      throw new AppError(`Items already sold or not found: ${missing.join(', ')}`, 400);
    }

    await prisma.inventoryItem.updateMany({
      where: { id: { in: ids } },
      data: { status: 'SOLD', saleId, saleItemId, soldAt: new Date() },
    });

    return records;
  },

  async getInventoryCount(variantId: string): Promise<{
    total: number;
    available: number;
    sold: number;
    returned: number;
    damaged: number;
    reserved: number;
  }> {
    const counts = await prisma.inventoryItem.groupBy({
      by: ['status'],
      where: { variantId },
      _count: true,
    });

    const result = { total: 0, available: 0, sold: 0, returned: 0, damaged: 0, reserved: 0 };
    for (const row of counts) {
      result[row.status.toLowerCase() as keyof typeof result] = row._count;
      result.total += row._count;
    }
    return result;
  },

  async printBarcodes(ids: string[], labelWidth: number = 50, labelHeight: number = 25) {
    const items = await prisma.inventoryItem.findMany({
      where: { id: { in: ids } },
      include: {
        productVariant: {
          include: { product: { select: { name: true } } },
        },
      },
    });

    if (items.length === 0) throw new AppError('No items found', 404);

    await ensureDir(BARCODE_DIR);
    const labels: Array<{
      barcode: string;
      imagePath: string;
      productName: string;
      variant: string;
      sku: string;
      price: number;
    }> = [];

    for (const item of items) {
      const filename = `label-${item.id}.png`;
      const filePath = path.join(BARCODE_DIR, filename);

      const png = await bwipjs.toBuffer({
        bcid: 'code128',
        text: item.barcode,
        scale: 2,
        height: 8,
        includetext: true,
        textxalign: 'center',
      });

      await fs.writeFile(filePath, png);

      const sizeParts = [
        item.productVariant.size,
        item.productVariant.color,
        item.productVariant.fabric,
      ].filter(Boolean);
      labels.push({
        barcode: item.barcode,
        imagePath: `/uploads/barcodes/items/${filename}`,
        productName: item.productVariant.product.name,
        variant: sizeParts.join(' / '),
        sku: item.productVariant.sku,
        price: Number(item.productVariant.sellingPrice),
      });
    }

    return { labels, labelWidth, labelHeight };
  },
};
