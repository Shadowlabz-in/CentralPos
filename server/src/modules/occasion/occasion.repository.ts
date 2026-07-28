import prisma from '../../utils/prisma';

export const occasionRepository = {
  async findAll(storeId?: string) {
    const where: any = { deletedAt: null };
    if (storeId) where.OR = [{ storeId }, { storeId: null }];
    return prisma.occasion.findMany({
      where,
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.occasion.findFirst({
      where: { id, deletedAt: null },
      include: { _count: { select: { products: true } } },
    });
  },

  async findBySlug(slug: string) {
    return prisma.occasion.findUnique({ where: { slug } });
  },

  async findByName(name: string, storeId?: string) {
    const where: any = { name, deletedAt: null };
    if (storeId) where.OR = [{ storeId }, { storeId: null }];
    return prisma.occasion.findFirst({ where });
  },

  async create(data: { name: string; slug: string; description?: string; storeId?: string }) {
    return prisma.occasion.create({ data });
  },

  async update(id: string, data: { name?: string; slug?: string; description?: string }) {
    return prisma.occasion.update({ where: { id }, data });
  },

  async softDelete(id: string) {
    return prisma.occasion.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
