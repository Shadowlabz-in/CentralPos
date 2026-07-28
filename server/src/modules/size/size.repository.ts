import prisma from '../../utils/prisma';

export const sizeRepository = {
  async findAll(storeId?: string) {
    return prisma.size.findMany({
      where: { deletedAt: null, ...(storeId ? { storeId } : {}) },
      orderBy: { sortOrder: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.size.findFirst({ where: { id, deletedAt: null } });
  },

  async findBySlug(slug: string) {
    return prisma.size.findUnique({ where: { slug } });
  },

  async findByName(name: string, storeId?: string) {
    return prisma.size.findFirst({
      where: { name, ...(storeId ? { storeId } : {}), deletedAt: null },
    });
  },

  async create(data: { name: string; slug: string; sortOrder?: number; storeId?: string }) {
    return prisma.size.create({ data });
  },

  async update(id: string, data: { name?: string; slug?: string; sortOrder?: number }) {
    return prisma.size.update({ where: { id }, data });
  },

  async softDelete(id: string) {
    return prisma.size.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};
