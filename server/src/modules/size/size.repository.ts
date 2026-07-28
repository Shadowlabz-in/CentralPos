import prisma from '../../utils/prisma';

export const sizeRepository = {
  async findAll(storeId?: string) {
    const where: any = { deletedAt: null };
    if (storeId) where.OR = [{ storeId }, { storeId: null }];
    return prisma.size.findMany({ where, orderBy: { sortOrder: 'asc' } });
  },

  async findById(id: string) {
    return prisma.size.findFirst({ where: { id, deletedAt: null } });
  },

  async findBySlug(slug: string) {
    return prisma.size.findUnique({ where: { slug } });
  },

  async findByName(name: string, storeId?: string) {
    const where: any = { name, deletedAt: null };
    if (storeId) where.OR = [{ storeId }, { storeId: null }];
    return prisma.size.findFirst({ where });
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
