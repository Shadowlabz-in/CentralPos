import { Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';

export const inventoryRepository = {
  async findVariants(filters: {
    skip: number;
    take: number;
    search?: string;
    categoryId?: string;
    brandId?: string;
    lowStock?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const where: Prisma.ProductVariantWhereInput = { deletedAt: null };

    if (filters.search) {
      where.OR = [
        { sku: { contains: filters.search, mode: 'insensitive' } },
        { barcode: { contains: filters.search, mode: 'insensitive' } },
        { product: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    if (filters.categoryId) {
      where.product = { categoryId: filters.categoryId };
    }

    if (filters.brandId) {
      where.product = { ...((where.product as any) || {}), brandId: filters.brandId };
    }

    if (filters.lowStock) {
      where.stockQuantity = { lte: 0 }; // Placeholder, actual filter done in JavaScript
    }

    const orderBy: Prisma.ProductVariantOrderByWithRelationInput = {};
    if (filters.sortBy === 'productName') orderBy.product = { name: filters.sortOrder || 'asc' };
    else if (filters.sortBy === 'sellingPrice') orderBy.sellingPrice = filters.sortOrder || 'asc';
    else if (filters.sortBy === 'stockQuantity') orderBy.stockQuantity = filters.sortOrder || 'asc';
    else orderBy.createdAt = 'desc';

    const variants = await prisma.productVariant.findMany({
      where,
      skip: filters.skip,
      take: filters.take,
      orderBy,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: { select: { id: true, name: true } },
            brand: { select: { id: true, name: true } },
          },
        },
      },
    });

    return variants;
  },

  async countVariants(filters: {
    search?: string;
    categoryId?: string;
    brandId?: string;
    lowStock?: boolean;
  }) {
    const where: Prisma.ProductVariantWhereInput = { deletedAt: null };

    if (filters.search) {
      where.OR = [
        { sku: { contains: filters.search, mode: 'insensitive' } },
        { barcode: { contains: filters.search, mode: 'insensitive' } },
        { product: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    if (filters.categoryId) {
      where.product = { categoryId: filters.categoryId };
    }

    if (filters.brandId) {
      where.product = { ...((where.product as any) || {}), brandId: filters.brandId };
    }

    if (filters.lowStock) {
      where.stockQuantity = { lte: prisma.productVariant.fields.reorderLevel };
    }

    return prisma.productVariant.count({ where });
  },

  async findLowStockVariants(storeId?: string) {
    const variants = await prisma.productVariant.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        storeId: storeId || undefined,
      },
      include: {
        product: { select: { id: true, name: true } },
      },
      orderBy: [{ stockQuantity: 'asc' }],
    });

    return variants.filter((v) => v.stockQuantity <= v.reorderLevel);
  },

  async findVariantById(id: string) {
    return prisma.productVariant.findFirst({
      where: { id, deletedAt: null },
    });
  },

  async updateStock(id: string, newQuantity: number) {
    return prisma.productVariant.update({
      where: { id },
      data: { stockQuantity: newQuantity },
    });
  },

  async createStockMovement(data: {
    productVariantId: string;
    quantity: number;
    type: string;
    previousStock: number;
    newStock: number;
    adjustmentReason?: string;
    purchaseItemId?: string;
    notes?: string;
    storeId: string;
    createdById: string;
  }) {
    return prisma.stockMovement.create({
      data: {
        productVariantId: data.productVariantId,
        quantity: data.quantity,
        type: data.type as any,
        previousStock: data.previousStock,
        newStock: data.newStock,
        adjustmentReason: data.adjustmentReason as any,
        purchaseItemId: data.purchaseItemId,
        notes: data.notes,
        storeId: data.storeId,
        createdById: data.createdById,
      },
    });
  },

  async findStockMovements(filters: {
    skip: number;
    take: number;
    productVariantId?: string;
    productId?: string;
    type?: string;
    fromDate?: string;
    toDate?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const where: Prisma.StockMovementWhereInput = {};

    if (filters.productVariantId) where.productVariantId = filters.productVariantId;

    if (filters.productId) {
      where.productVariant = { productId: filters.productId };
    }

    if (filters.type) where.type = filters.type as any;

    if (filters.fromDate || filters.toDate) {
      where.createdAt = {};
      if (filters.fromDate) where.createdAt.gte = new Date(filters.fromDate);
      if (filters.toDate) where.createdAt.lte = new Date(filters.toDate);
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip: filters.skip,
        take: filters.take,
        orderBy: { createdAt: filters.sortOrder || 'desc' },
        include: {
          productVariant: {
            select: {
              id: true,
              sku: true,
              size: true,
              color: true,
              product: { select: { id: true, name: true } },
            },
          },
          createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return { movements, total };
  },

  async getValuation() {
    const variants = await prisma.productVariant.findMany({
      where: { deletedAt: null, isActive: true },
      select: {
        id: true,
        sku: true,
        stockQuantity: true,
        purchasePrice: true,
        product: { select: { id: true, name: true } },
      },
    });

    const items = variants.map((v) => ({
      variantId: v.id,
      sku: v.sku,
      productName: v.product.name,
      stockQuantity: v.stockQuantity,
      purchasePrice: Number(v.purchasePrice),
      value: v.stockQuantity * Number(v.purchasePrice),
    }));

    const totalValue = items.reduce((sum, i) => sum + i.value, 0);

    return { totalValue, items };
  },
};
