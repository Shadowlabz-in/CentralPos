import prisma from '../../utils/prisma';

export const countryRepository = {
  async findAll(storeId?: string) {
    return prisma.country.findMany({
      where: { deletedAt: null, ...(storeId ? { storeId } : {}) },
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.country.findFirst({
      where: { id, deletedAt: null },
      include: { _count: { select: { products: true } } },
    });
  },

  async findByCode(code: string) {
    return prisma.country.findUnique({ where: { code } });
  },

  async findBySlug(slug: string) {
    return prisma.country.findUnique({ where: { slug } });
  },

  async findByName(name: string, storeId?: string) {
    return prisma.country.findFirst({
      where: { name, ...(storeId ? { storeId } : {}), deletedAt: null },
    });
  },

  async create(data: { name: string; code: string; slug: string; storeId?: string }) {
    return prisma.country.create({ data });
  },

  async update(id: string, data: { name?: string; code?: string; slug?: string }) {
    return prisma.country.update({ where: { id }, data });
  },

  async softDelete(id: string) {
    return prisma.country.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
