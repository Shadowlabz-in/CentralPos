import { variantRepository } from './variant.repository';
import { productRepository } from '../product/product.repository';
import { AppError } from '../../middleware/errorHandler';
import { generateSku, generateBarcode } from '../../utils/sku';
import prisma from '../../utils/prisma';

const bwipjs = require('bwip-js');
import path from 'path';
import fs from 'fs/promises';

const BARCODE_DIR = path.resolve(__dirname, '../../../uploads/barcodes');

async function ensureDir(dir: string) {
  return fs.mkdir(dir, { recursive: true });
}

async function generateBarcodeImage(variantId: string, barcodeValue: string) {
  try {
    await ensureDir(BARCODE_DIR);
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

    return imageUrl;
  } catch {
    return null;
  }
}

export const variantService = {
  async list(productId: string) {
    const product = await productRepository.findById(productId);
    if (!product) throw new AppError('Product not found', 404);

    return variantRepository.findByProductId(productId);
  },

  async getById(id: string) {
    const variant = await variantRepository.findById(id);
    if (!variant) throw new AppError('Variant not found', 404);
    return variant;
  },

  async create(
    productId: string,
    data: {
      size?: string;
      color?: string;
      fabric?: string;
      rackLocation?: string;
      sku?: string;
      barcode?: string;
      purchasePrice: number;
      sellingPrice: number;
      mrp?: number;
      gstPercentage: number;
      stockQuantity: number;
      initialStock?: number;
      reorderLevel: number;
      isActive?: boolean;
      storeId?: string;
      createdById?: string;
    },
  ) {
    const product = await productRepository.findById(productId);
    if (!product) throw new AppError('Product not found', 404);

    if (data.sellingPrice < data.purchasePrice) {
      throw new AppError('Selling price cannot be less than purchase price', 400);
    }

    const stockQty = data.initialStock ?? data.stockQuantity;

    if (stockQty < 0) {
      throw new AppError('Stock quantity cannot be negative', 400);
    }

    const sku = data.sku ?? (await generateSku(product.name, data.size, data.color));
    const barcode = data.barcode ?? (await generateBarcode());

    if (data.sku) {
      const existingSku = await variantRepository.findBySku(data.sku);
      if (existingSku) throw new AppError('SKU already exists', 409);
    }

    if (data.barcode) {
      const existingBarcode = await variantRepository.findByBarcode(data.barcode);
      if (existingBarcode) throw new AppError('Barcode already exists', 409);
    }

    const existingCombo = await variantRepository.findByProductIdSizeColor(
      productId,
      data.size,
      data.color,
      data.fabric,
    );
    if (existingCombo) {
      throw new AppError(
        'A variant with this size, color and fabric combination already exists for this product',
        409,
      );
    }

    const variant = await prisma.$transaction(async (tx) => {
      const v = await variantRepository.create(
        { ...data, productId, sku, barcode, stockQuantity: stockQty },
        tx,
      );

      if (stockQty > 0) {
        const movementData: any = {
          productVariantId: v.id,
          quantity: stockQty,
          type: 'OPENING_STOCK',
          adjustmentReason: 'OPENING_STOCK',
          previousStock: 0,
          newStock: stockQty,
          notes: 'Initial stock on variant creation',
          storeId: data.storeId || '',
          createdById: data.createdById || '',
        };

        await tx.stockMovement.create({ data: movementData });
      }

      return v;
    });

    generateBarcodeImage(variant.id, barcode);

    return variantRepository.findById(variant.id);
  },

  async update(
    id: string,
    data: {
      size?: string;
      color?: string;
      fabric?: string;
      rackLocation?: string;
      sku?: string;
      barcode?: string;
      purchasePrice?: number;
      sellingPrice?: number;
      mrp?: number;
      gstPercentage?: number;
      stockQuantity?: number;
      reorderLevel?: number;
      isActive?: boolean;
    },
  ) {
    const variant = await variantRepository.findById(id);
    if (!variant) throw new AppError('Variant not found', 404);

    if (data.sku && data.sku !== variant.sku) {
      const existingSku = await variantRepository.findBySku(data.sku, id);
      if (existingSku) throw new AppError('SKU already exists', 409);
    }

    if (data.barcode && data.barcode !== variant.barcode) {
      const existingBarcode = await variantRepository.findByBarcode(data.barcode, id);
      if (existingBarcode) throw new AppError('Barcode already exists', 409);
    }

    const finalSellingPrice = data.sellingPrice ?? Number(variant.sellingPrice);
    const finalPurchasePrice = data.purchasePrice ?? Number(variant.purchasePrice);
    if (finalSellingPrice < finalPurchasePrice) {
      throw new AppError('Selling price cannot be less than purchase price', 400);
    }

    if (data.size !== undefined || data.color !== undefined || data.fabric !== undefined) {
      const finalSize = data.size ?? variant.size ?? undefined;
      const finalColor = data.color ?? variant.color ?? undefined;
      const finalFabric = data.fabric ?? variant.fabric ?? undefined;
      const existingCombo = await variantRepository.findByProductIdSizeColor(
        variant.productId,
        finalSize,
        finalColor,
        finalFabric,
        id,
      );
      if (existingCombo) {
        throw new AppError(
          'A variant with this size, color and fabric combination already exists for this product',
          409,
        );
      }
    }

    return variantRepository.update(id, data);
  },

  async delete(id: string) {
    const variant = await variantRepository.findById(id);
    if (!variant) throw new AppError('Variant not found', 404);

    await variantRepository.softDelete(id);
  },
};
