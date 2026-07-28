import prisma from '../../utils/prisma';

export const brandRepository = {
  async findAll(storeId?: string) {
    const where: any = { deletedAt: null };
    if (storeId) where.OR = [{ storeId }, { storeId: null }];
    return prisma.brand.findMany({
      where,
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.brand.findFirst({
      where: { id, deletedAt: null },
      include: { _count: { select: { products: true } } },
    });
  },

  async findBySlug(slug: string) {
    return prisma.brand.findUnique({ where: { slug } });
  },

  async findByName(name: string, storeId?: string) {
    const where: any = { name, deletedAt: null };
    if (storeId) where.OR = [{ storeId }, { storeId: null }];
    return prisma.brand.findFirst({ where });
  },

  async create(data: { name: string; slug: string; description?: string; storeId?: string }) {
    return prisma.brand.create({ data });
  },

  async update(id: string, data: { name?: string; slug?: string; description?: string }) {
    return prisma.brand.update({ where: { id }, data });
  },

  async softDelete(id: string) {
    return prisma.brand.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
