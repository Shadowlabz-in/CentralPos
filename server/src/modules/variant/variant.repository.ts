import { Prisma } from '@prisma/client';
import prisma, { PrismaTransactionClient } from '../../utils/prisma';

export const variantRepository = {
  async findByProductId(productId: string) {
    return prisma.productVariant.findMany({
      where: { productId, deletedAt: null },
      orderBy: [{ color: 'asc' }, { size: 'asc' }],
    });
  },

  async findById(id: string) {
    return prisma.productVariant.findFirst({
      where: { id, deletedAt: null },
      include: {
        product: { select: { id: true, name: true, slug: true, supplierId: true } },
        supplier: { select: { id: true, name: true } },
      },
    });
  },

  async findBySku(sku: string, excludeId?: string) {
    const where: Prisma.ProductVariantWhereInput = { sku, deletedAt: null };
    if (excludeId) where.id = { not: excludeId };
    return prisma.productVariant.findFirst({ where });
  },

  async findByBarcode(barcode: string, excludeId?: string) {
    const where: Prisma.ProductVariantWhereInput = { barcode, deletedAt: null };
    if (excludeId) where.id = { not: excludeId };
    return prisma.productVariant.findFirst({ where });
  },

  async findByProductIdSizeColor(
    productId: string,
    size?: string,
    color?: string,
    fabric?: string,
    excludeId?: string,
  ) {
    const where: Prisma.ProductVariantWhereInput = {
      productId,
      size,
      color,
      fabric,
      deletedAt: null,
    };
    if (excludeId) where.id = { not: excludeId };
    return prisma.productVariant.findFirst({ where });
  },

  async create(
    data: {
      productId: string;
      sku: string;
      barcode: string;
      size?: string;
      color?: string;
      colorHex?: string;
      ean?: string;
      fabric?: string;
      rackLocation?: string;
      supplierId?: string;
      purchasePrice: number;
      sellingPrice: number;
      mrp?: number;
      gstPercentage: number;
      stockQuantity: number;
      reorderLevel: number;
      isActive?: boolean;
    },
    tx?: PrismaTransactionClient,
  ) {
    const gstMap: Record<number, string> = {
      0: 'GST_0',
      5: 'GST_5',
      12: 'GST_12',
      18: 'GST_18',
      28: 'GST_28',
    };
    const client = tx || prisma;
    const { rackLocation, ...rest } = data;
    return client.productVariant.create({
      data: {
        ...rest,
        rackLocation: rackLocation || undefined,
        purchasePrice: data.purchasePrice,
        sellingPrice: data.sellingPrice,
        mrp: data.mrp || undefined,
        gstPercentage: gstMap[data.gstPercentage] as any,
      },
    });
  },

  async update(
    id: string,
    data: {
      sku?: string;
      barcode?: string;
      size?: string;
      color?: string;
      colorHex?: string;
      ean?: string;
      fabric?: string;
      rackLocation?: string;
      supplierId?: string | null;
      purchasePrice?: number;
      sellingPrice?: number;
      mrp?: number;
      gstPercentage?: number;
      stockQuantity?: number;
      reorderLevel?: number;
      isActive?: boolean;
    },
  ) {
    const updateData: any = { ...data };
    if ('supplierId' in data) {
      updateData.supplier = data.supplierId ? { connect: { id: data.supplierId } } : { disconnect: true };
      delete updateData.supplierId;
    }
    if (data.gstPercentage !== undefined) {
      const gstMap: Record<number, string> = {
        0: 'GST_0',
        5: 'GST_5',
        12: 'GST_12',
        18: 'GST_18',
        28: 'GST_28',
      };
      updateData.gstPercentage = gstMap[data.gstPercentage] as any;
    }
    return prisma.productVariant.update({
      where: { id },
      data: updateData,
    });
  },

  async softDelete(id: string) {
    return prisma.productVariant.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
