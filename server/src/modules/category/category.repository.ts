import prisma from '../../utils/prisma';

export const categoryRepository = {
  async findAll(storeId?: string) {
    const where: any = { deletedAt: null };
    if (storeId) where.OR = [{ storeId }, { storeId: null }];
    return prisma.category.findMany({
      where,
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true, children: true } },
      },
      orderBy: { name: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.category.findFirst({
      where: { id, deletedAt: null },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: { where: { deletedAt: null }, select: { id: true, name: true, slug: true } },
        _count: { select: { products: true } },
      },
    });
  },

  async findBySlug(slug: string) {
    return prisma.category.findUnique({ where: { slug } });
  },

  async findByName(name: string, storeId?: string) {
    const where: any = { name, deletedAt: null };
    if (storeId) where.OR = [{ storeId }, { storeId: null }];
    return prisma.category.findFirst({
      where,
    });
  },

  async create(data: {
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
    storeId?: string;
  }) {
    return prisma.category.create({ data });
  },

  async update(
    id: string,
    data: { name?: string; slug?: string; description?: string; parentId?: string | null },
  ) {
    return prisma.category.update({ where: { id }, data });
  },

  async softDelete(id: string) {
    return prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
