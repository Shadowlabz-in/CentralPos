import prisma from '../../utils/prisma';

export const fabricRepository = {
  async findAll(storeId?: string) {
    return prisma.fabric.findMany({
      where: { deletedAt: null, storeId: storeId || undefined },
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.fabric.findFirst({
      where: { id, deletedAt: null },
      include: { _count: { select: { products: true } } },
    });
  },

  async findBySlug(slug: string) {
    return prisma.fabric.findUnique({ where: { slug } });
  },

  async findByName(name: string, storeId?: string) {
    return prisma.fabric.findFirst({
      where: { name, storeId: storeId || undefined, deletedAt: null },
    });
  },

  async create(data: { name: string; slug: string; description?: string; storeId?: string }) {
    return prisma.fabric.create({ data });
  },

  async update(id: string, data: { name?: string; slug?: string; description?: string }) {
    return prisma.fabric.update({ where: { id }, data });
  },

  async softDelete(id: string) {
    return prisma.fabric.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
