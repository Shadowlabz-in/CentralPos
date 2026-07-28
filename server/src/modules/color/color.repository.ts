import prisma from '../../utils/prisma';

export const colorRepository = {
  async findAll(storeId?: string) {
    const where: any = { deletedAt: null };
    if (storeId) where.OR = [{ storeId }, { storeId: null }];
    return prisma.color.findMany({ where, orderBy: { name: 'asc' } });
  },

  async findById(id: string) {
    return prisma.color.findFirst({ where: { id, deletedAt: null } });
  },

  async findBySlug(slug: string) {
    return prisma.color.findUnique({ where: { slug } });
  },

  async findByName(name: string, storeId?: string) {
    const where: any = { name, deletedAt: null };
    if (storeId) where.OR = [{ storeId }, { storeId: null }];
    return prisma.color.findFirst({ where });
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
