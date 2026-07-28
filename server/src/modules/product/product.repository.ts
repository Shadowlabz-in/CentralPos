import { Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
  size?: string;
  color?: string;
  storeId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const productInclude = {
  category: { select: { id: true, name: true, slug: true } },
  brand: { select: { id: true, name: true, slug: true } },
  supplier: { select: { id: true, name: true } },
  hsnCode: { select: { id: true, code: true, description: true } },
  fabric: { select: { id: true, name: true } },
  occasion: { select: { id: true, name: true } },
  countryOfOrigin: { select: { id: true, name: true, code: true } },
} as const;

export const productRepository = {
  async findAll(skip: number, take: number, filters: ProductFilters) {
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(filters.storeId ? { storeId: { in: [filters.storeId, null] } as any } : {}),
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { variants: { some: { sku: { contains: filters.search, mode: 'insensitive' } } } },
        { variants: { some: { barcode: { contains: filters.search, mode: 'insensitive' } } } },
      ];
    }

    if (filters.categoryId) where.categoryId = filters.categoryId;

    if (filters.brandId) where.brandId = filters.brandId;

    if (filters.isActive !== undefined) where.isActive = filters.isActive;

    if (filters.size || filters.color) {
      const variantFilters: Prisma.ProductVariantWhereInput = {};
      if (filters.size) variantFilters.size = filters.size;
      if (filters.color) variantFilters.color = filters.color;
      where.variants = { some: { ...variantFilters, deletedAt: null } };
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (filters.sortBy === 'name') orderBy.name = filters.sortOrder || 'desc';
    else orderBy.createdAt = filters.sortOrder || 'desc';

    return prisma.product.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        ...productInclude,
        images: {
          where: { product: { deletedAt: null } },
          orderBy: { sortOrder: 'asc' },
          select: { id: true, url: true, alt: true, isPrimary: true },
        },
        variants: {
          where: { deletedAt: null },
          select: {
            id: true,
            size: true,
            color: true,
            colorHex: true,
            sku: true,
            barcode: true,
            ean: true,
            sellingPrice: true,
            purchasePrice: true,
            mrp: true,
            gstPercentage: true,
            stockQuantity: true,
            reorderLevel: true,
            fabric: true,
            isActive: true,
          },
          orderBy: [{ color: 'asc' }, { size: 'asc' }],
        },
        _count: { select: { variants: true } },
      },
    });
  },

  async countAll(filters: ProductFilters) {
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(filters.storeId ? { storeId: { in: [filters.storeId, null] } } : {}),
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { variants: { some: { sku: { contains: filters.search, mode: 'insensitive' } } } },
        { variants: { some: { barcode: { contains: filters.search, mode: 'insensitive' } } } },
      ];
    }

    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.brandId) where.brandId = filters.brandId;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;

    if (filters.size || filters.color) {
      const variantFilters: Prisma.ProductVariantWhereInput = {};
      if (filters.size) variantFilters.size = filters.size;
      if (filters.color) variantFilters.color = filters.color;
      where.variants = { some: { ...variantFilters, deletedAt: null } };
    }

    return prisma.product.count({ where });
  },

  async findById(id: string) {
    return prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        ...productInclude,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        variants: {
          where: { deletedAt: null },
          orderBy: [{ color: 'asc' }, { size: 'asc' }],
        },
      },
    });
  },

  async findBySlug(slug: string) {
    return prisma.product.findUnique({ where: { slug } });
  },

  async create(data: {
    name: string;
    slug: string;
    description?: string;
    tags?: string[];
    categoryId: string;
    brandId?: string | null;
    supplierId?: string | null;
    hsnCodeId?: string | null;
    fabricId?: string | null;
    occasionId?: string | null;
    countryOfOriginId?: string | null;
    careInstructions?: string | null;
    modelNumber?: string | null;
    gtin?: string | null;
    isActive?: boolean;
  }) {
    return prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        tags: data.tags,
        careInstructions: data.careInstructions,
        modelNumber: data.modelNumber,
        gtin: data.gtin,
        isActive: data.isActive,
        category: { connect: { id: data.categoryId } },
        brand: data.brandId ? { connect: { id: data.brandId } } : undefined,
        supplier: data.supplierId ? { connect: { id: data.supplierId } } : undefined,
        hsnCode: data.hsnCodeId ? { connect: { id: data.hsnCodeId } } : undefined,
        fabric: data.fabricId ? { connect: { id: data.fabricId } } : undefined,
        occasion: data.occasionId ? { connect: { id: data.occasionId } } : undefined,
        countryOfOrigin: data.countryOfOriginId ? { connect: { id: data.countryOfOriginId } } : undefined,
      },
      include: productInclude,
    });
  },

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      tags?: string[];
      categoryId?: string;
      brandId?: string | null;
      supplierId?: string | null;
      hsnCodeId?: string | null;
      fabricId?: string | null;
      occasionId?: string | null;
      countryOfOriginId?: string | null;
      careInstructions?: string | null;
      modelNumber?: string | null;
      gtin?: string | null;
      isActive?: boolean;
    },
  ) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.careInstructions !== undefined) updateData.careInstructions = data.careInstructions;
    if (data.modelNumber !== undefined) updateData.modelNumber = data.modelNumber;
    if (data.gtin !== undefined) updateData.gtin = data.gtin;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.categoryId !== undefined) updateData.category = { connect: { id: data.categoryId } };
    if (data.brandId !== undefined) updateData.brand = data.brandId ? { connect: { id: data.brandId } } : { disconnect: true };
    if (data.supplierId !== undefined) updateData.supplier = data.supplierId ? { connect: { id: data.supplierId } } : { disconnect: true };
    if (data.hsnCodeId !== undefined) updateData.hsnCode = data.hsnCodeId ? { connect: { id: data.hsnCodeId } } : { disconnect: true };
    if (data.fabricId !== undefined) updateData.fabric = data.fabricId ? { connect: { id: data.fabricId } } : { disconnect: true };
    if (data.occasionId !== undefined) updateData.occasion = data.occasionId ? { connect: { id: data.occasionId } } : { disconnect: true };
    if (data.countryOfOriginId !== undefined) updateData.countryOfOrigin = data.countryOfOriginId ? { connect: { id: data.countryOfOriginId } } : { disconnect: true };

    return prisma.product.update({
      where: { id },
      data: updateData,
      include: productInclude,
    });
  },

  async softDelete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async addImage(data: {
    productId: string;
    url: string;
    alt?: string;
    isPrimary?: boolean;
    sortOrder?: number;
  }) {
    return prisma.productImage.create({ data });
  },

  async updateImage(
    id: string,
    data: { url?: string; alt?: string; isPrimary?: boolean; sortOrder?: number },
  ) {
    return prisma.productImage.update({ where: { id }, data });
  },

  async deleteImage(id: string) {
    return prisma.productImage.delete({ where: { id } });
  },

  async findImageById(id: string) {
    return prisma.productImage.findUnique({ where: { id } });
  },

  async setPrimaryImage(productId: string, imageId: string) {
    await prisma.productImage.updateMany({
      where: { productId, isPrimary: true },
      data: { isPrimary: false },
    });
    return prisma.productImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    });
  },
};
