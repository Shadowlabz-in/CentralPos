import { Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';

export interface PurchaseFilters {
  search?: string;
  supplierId?: string;
  status?: string;
  paymentStatus?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const purchaseRepository = {
  async findAll(skip: number, take: number, filters: PurchaseFilters) {
    const where: Prisma.PurchaseWhereInput = { deletedAt: null };

    if (filters.search) {
      where.OR = [
        { invoiceNumber: { contains: filters.search, mode: 'insensitive' } },
        { supplier: { name: { contains: filters.search, mode: 'insensitive' } } },
        {
          items: {
            some: {
              productVariant: {
                OR: [
                  { sku: { contains: filters.search, mode: 'insensitive' } },
                  { product: { name: { contains: filters.search, mode: 'insensitive' } } },
                ],
              },
            },
          },
        },
      ];
    }

    if (filters.supplierId) where.supplierId = filters.supplierId;
    if (filters.status) where.status = filters.status as any;
    if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus as any;

    if (filters.fromDate || filters.toDate) {
      where.purchaseDate = {};
      if (filters.fromDate) where.purchaseDate.gte = new Date(filters.fromDate);
      if (filters.toDate) where.purchaseDate.lte = new Date(filters.toDate);
    }

    const orderBy: Prisma.PurchaseOrderByWithRelationInput = {};
    if (filters.sortBy === 'purchaseDate') orderBy.purchaseDate = filters.sortOrder || 'desc';
    else if (filters.sortBy === 'grandTotal') orderBy.grandTotal = filters.sortOrder || 'desc';
    else orderBy.createdAt = filters.sortOrder || 'desc';

    return prisma.purchase.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        supplier: { select: { id: true, name: true, phone: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        items: {
          include: {
            productVariant: {
              select: {
                id: true,
                sku: true,
                barcode: true,
                size: true,
                color: true,
                product: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });
  },

  async countAll(filters: PurchaseFilters) {
    const where: Prisma.PurchaseWhereInput = { deletedAt: null };

    if (filters.search) {
      where.OR = [
        { invoiceNumber: { contains: filters.search, mode: 'insensitive' } },
        { supplier: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    if (filters.supplierId) where.supplierId = filters.supplierId;
    if (filters.status) where.status = filters.status as any;
    if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus as any;

    if (filters.fromDate || filters.toDate) {
      where.purchaseDate = {};
      if (filters.fromDate) where.purchaseDate.gte = new Date(filters.fromDate);
      if (filters.toDate) where.purchaseDate.lte = new Date(filters.toDate);
    }

    return prisma.purchase.count({ where });
  },

  async findById(id: string) {
    return prisma.purchase.findFirst({
      where: { id, deletedAt: null },
      include: {
        supplier: { select: { id: true, name: true, phone: true, email: true, gstin: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        items: {
          include: {
            productVariant: {
              select: {
                id: true,
                sku: true,
                barcode: true,
                size: true,
                color: true,
                purchasePrice: true,
                sellingPrice: true,
                stockQuantity: true,
                product: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });
  },

  async findByInvoice(invoiceNumber: string) {
    return prisma.purchase.findUnique({ where: { invoiceNumber } });
  },

  async create(data: Prisma.PurchaseCreateInput) {
    return prisma.purchase.create({ data });
  },

  async update(id: string, data: Prisma.PurchaseUpdateInput) {
    return prisma.purchase.update({ where: { id }, data });
  },
};
