import prisma from '../../utils/prisma';
import { inventoryRepository } from './inventory.repository';
import { AppError } from '../../middleware/errorHandler';

export const inventoryService = {
  async current(filters: {
    page: number;
    limit: number;
    search?: string;
    categoryId?: string;
    brandId?: string;
    lowStock?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page, limit, ...restFilters } = filters;
    const skip = (page - 1) * limit;

    let [variants, total] = await Promise.all([
      inventoryRepository.findVariants({ ...restFilters, skip, take: limit }),
      inventoryRepository.countVariants(restFilters),
    ]);

    let data = variants.map((v) => ({
      id: v.id,
      variantId: v.id,
      sku: v.sku,
      barcode: v.barcode,
      size: v.size,
      color: v.color,
      productName: v.product.name,
      product: v.product,
      category: v.product.category,
      brand: v.product.brand,
      stockQuantity: v.stockQuantity,
      reorderLevel: v.reorderLevel,
      purchasePrice: Number(v.purchasePrice),
      sellingPrice: Number(v.sellingPrice),
      gstPercentage: v.gstPercentage,
      isLowStock: v.stockQuantity <= v.reorderLevel,
      isActive: v.isActive,
    }));

    if (filters.lowStock) {
      data = data.filter((v) => v.isLowStock);
      total = data.length;
    }

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async lowStock(storeId?: string) {
    const variants = await inventoryRepository.findLowStockVariants(storeId);

    return variants.map((v) => ({
      variantId: v.id,
      sku: v.sku,
      barcode: v.barcode,
      size: v.size,
      color: v.color,
      productName: v.product.name,
      stockQuantity: v.stockQuantity,
      reorderLevel: v.reorderLevel,
      deficit: v.reorderLevel - v.stockQuantity,
    }));
  },

  async adjust(data: {
    productVariantId: string;
    quantity: number;
    reason: string;
    notes?: string;
    createdById: string;
    storeId: string;
  }) {
    const variant = await inventoryRepository.findVariantById(data.productVariantId);
    if (!variant) throw new AppError('Product variant not found', 404);

    const previousStock = variant.stockQuantity;
    const newStock = previousStock + data.quantity;

    if (newStock < 0) {
      throw new AppError(
        `Insufficient stock. Current: ${previousStock}, requested change: ${data.quantity}. Stock cannot go negative.`,
        400,
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.productVariant.update({
        where: { id: data.productVariantId },
        data: { stockQuantity: newStock },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productVariantId: data.productVariantId,
          quantity: data.quantity,
          type: data.quantity < 0 ? 'ADJUSTMENT' : 'ADJUSTMENT',
          adjustmentReason: data.reason as any,
          previousStock,
          newStock,
          notes: data.notes || null,
          storeId: data.storeId,
          createdById: data.createdById,
        },
      });

      return movement;
    });

    return result;
  },

  async history(filters: {
    page: number;
    limit: number;
    productVariantId?: string;
    productId?: string;
    type?: string;
    fromDate?: string;
    toDate?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page, limit, ...restFilters } = filters;
    const skip = (page - 1) * limit;

    const { movements, total } = await inventoryRepository.findStockMovements({
      ...restFilters,
      skip,
      take: limit,
    });

    return {
      data: movements.map((m) => ({
        id: m.id,
        productVariantId: m.productVariantId,
        variant: m.productVariant,
        quantity: m.quantity,
        type: m.type,
        previousStock: m.previousStock,
        newStock: m.newStock,
        adjustmentReason: m.adjustmentReason,
        notes: m.notes,
        createdBy: m.createdBy,
        createdAt: m.createdAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async valuation() {
    return inventoryRepository.getValuation();
  },
};
