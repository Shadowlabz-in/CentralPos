import prisma from '../../utils/prisma';

export const hsnCodeRepository = {
  async findAll(storeId?: string) {
    const where: any = { deletedAt: null };
    if (storeId) where.OR = [{ storeId }, { storeId: null }];
    return prisma.hsnCode.findMany({
      where,
      include: { _count: { select: { products: true } } },
      orderBy: { code: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.hsnCode.findFirst({
      where: { id, deletedAt: null },
      include: { _count: { select: { products: true } } },
    });
  },

  async findByCode(code: string) {
    return prisma.hsnCode.findUnique({ where: { code } });
  },

  async create(data: { code: string; description?: string; storeId?: string }) {
    return prisma.hsnCode.create({ data });
  },

  async update(id: string, data: { code?: string; description?: string }) {
    return prisma.hsnCode.update({ where: { id }, data });
  },

  async softDelete(id: string) {
    return prisma.hsnCode.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
