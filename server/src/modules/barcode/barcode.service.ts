import path from 'path';
import fs from 'fs/promises';
import prisma from '../../utils/prisma';
import { AppError } from '../../middleware/errorHandler';

const bwipjs = require('bwip-js');

const BARCODE_DIR = path.resolve(__dirname, '../../../uploads/barcodes');

function ensureDir(dir: string) {
  return fs.mkdir(dir, { recursive: true });
}

export const barcodeService = {
  async lookupBarcode(barcode: string) {
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

    if (item) {
      if (item.status !== 'AVAILABLE') {
        throw new AppError(
          item.status === 'SOLD'
            ? 'This item has already been sold'
            : `This item is ${item.status.toLowerCase()}`,
          400,
        );
      }
      return {
        ...item.productVariant,
        inventoryItemId: item.id,
        inventoryItemStatus: item.status,
      };
    }

    const variant = await prisma.productVariant.findFirst({
      where: { barcode, deletedAt: null, isActive: true },
      include: {
        product: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!variant) throw new AppError('Product not found for this barcode', 404);
    return variant;
  },

  async generateBarcodeImage(variantId: string) {
    const variant = await prisma.productVariant.findFirst({
      where: { id: variantId, deletedAt: null },
    });
    if (!variant) throw new AppError('Variant not found', 404);

    await ensureDir(BARCODE_DIR);

    const barcodeValue = variant.barcode;
    const filename = `barcode-${variantId}.png`;
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

    const imageUrl = `/uploads/barcodes/${filename}`;

    await prisma.productVariant.update({
      where: { id: variantId },
      data: { barcodeImagePath: imageUrl },
    });

    return { barcodeImagePath: imageUrl, barcode: barcodeValue };
  },

  async regenerate(variantId: string) {
    return barcodeService.generateBarcodeImage(variantId);
  },

  async getBarcodeImagePath(variantId: string) {
    const variant = await prisma.productVariant.findFirst({
      where: { id: variantId, deletedAt: null },
    });
    if (!variant) throw new AppError('Variant not found', 404);

    if (variant.barcodeImagePath) {
      const fullPath = path.resolve(__dirname, '../../..', variant.barcodeImagePath);
      try {
        await fs.access(fullPath);
        return variant.barcodeImagePath;
      } catch {
        // File doesn't exist, regenerate
      }
    }

    const result = await barcodeService.generateBarcodeImage(variantId);
    return result.barcodeImagePath;
  },
};
