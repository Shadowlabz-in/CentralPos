import prisma from '../../utils/prisma';

export const colorRepository = {
  async findAll(storeId?: string) {
    return prisma.color.findMany({
      where: { deletedAt: null, ...(storeId ? { storeId } : {}) },
      orderBy: { name: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.color.findFirst({ where: { id, deletedAt: null } });
  },

  async findBySlug(slug: string) {
    return prisma.color.findUnique({ where: { slug } });
  },

  async findByName(name: string, storeId?: string) {
    return prisma.color.findFirst({
      where: { name, ...(storeId ? { storeId } : {}), deletedAt: null },
    });
  },

  async create(data: { name: string; slug: string; hex?: string; storeId?: string }) {
    return prisma.color.create({ data });
  },

  async update(id: string, data: { name?: string; slug?: string; hex?: string }) {
    return prisma.color.update({ where: { id }, data });
  },

  async softDelete(id: string) {
    return prisma.color.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};
