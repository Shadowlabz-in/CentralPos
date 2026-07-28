import prisma from '../../utils/prisma';

export const supplierRepository = {
  async findAll(storeId?: string) {
    const where: any = { deletedAt: null };
    if (storeId) where.OR = [{ storeId }, { storeId: null }];
    return prisma.supplier.findMany({
      where,
      include: { _count: { select: { purchases: true } } },
      orderBy: { name: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.supplier.findFirst({
      where: { id, deletedAt: null },
      include: { _count: { select: { purchases: true } } },
    });
  },

  async findByPhone(phone: string, excludeId?: string) {
    return prisma.supplier.findFirst({
      where: { phone, deletedAt: null, id: excludeId ? { not: excludeId } : undefined },
    });
  },

  async findByGstin(gstin: string, excludeId?: string) {
    return prisma.supplier.findFirst({
      where: { gstin, deletedAt: null, id: excludeId ? { not: excludeId } : undefined },
    });
  },

  async create(data: {
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    gstin?: string;
    storeId?: string;
  }) {
    return prisma.supplier.create({ data });
  },

  async update(
    id: string,
    data: {
      name?: string;
      contactPerson?: string;
      phone?: string;
      email?: string;
      address?: string;
      city?: string;
      state?: string;
      pincode?: string;
      gstin?: string;
      isActive?: boolean;
    },
  ) {
    return prisma.supplier.update({ where: { id }, data });
  },

  async softDelete(id: string) {
    return prisma.supplier.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
