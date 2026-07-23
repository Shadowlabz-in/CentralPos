import { Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
  size?: string;
  color?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const productRepository = {
  async findAll(skip: number, take: number, filters: ProductFilters) {
    const where: Prisma.ProductWhereInput = { deletedAt: null };

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
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
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
            sku: true,
            barcode: true,
            sellingPrice: true,
            stockQuantity: true,
            isActive: true,
          },
          orderBy: [{ color: 'asc' }, { size: 'asc' }],
        },
        _count: { select: { variants: true } },
      },
    });
  },

  async countAll(filters: ProductFilters) {
    const where: Prisma.ProductWhereInput = { deletedAt: null };

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
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
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
    isActive?: boolean;
  }) {
    return prisma.product.create({
      data,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
      },
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
      isActive?: boolean;
    },
  ) {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
      },
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
