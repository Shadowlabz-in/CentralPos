import prisma from '../../utils/prisma';

export const saleRepository = {
  async findById(id: string) {
    return prisma.sale.findFirst({
      where: { id, deletedAt: null },
      include: {
        customer: true,
        items: {
          include: {
            productVariant: {
              include: { product: { select: { id: true, name: true } } },
            },
          },
        },
        payments: true,
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  },

  async findAll(params: {
    page: number;
    limit: number;
    fromDate?: string;
    toDate?: string;
    customerId?: string;
  }) {
    const { page, limit, fromDate, toDate, customerId } = params;
    const where: any = { deletedAt: null };
    if (fromDate || toDate) {
      where.saleDate = {};
      if (fromDate) where.saleDate.gte = new Date(fromDate);
      if (toDate) where.saleDate.lte = new Date(toDate + 'T23:59:59.999Z');
    }
    if (customerId) where.customerId = customerId;

    const [data, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true } },
          items: {
            include: {
              productVariant: {
                select: {
                  id: true,
                  sku: true,
                  size: true,
                  color: true,
                  product: { select: { name: true } },
                },
              },
            },
          },
          payments: true,
          createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.sale.count({ where }),
    ]);
    return { data, total };
  },

  async countToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return prisma.sale.count({
      where: { createdAt: { gte: today } },
    });
  },
};
