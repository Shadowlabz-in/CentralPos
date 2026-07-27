import prisma from '../../utils/prisma';

export const demoRequestRepository = {
  async create(data: {
    businessName: string;
    ownerName: string;
    phone: string;
    email: string;
    city: string;
    businessType: string;
    message?: string;
  }) {
    return prisma.demoRequest.create({ data });
  },

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.demoRequest.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.demoRequest.count(),
    ]);
    return {
      data: items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async findById(id: string) {
    return prisma.demoRequest.findUnique({ where: { id } });
  },

  async update(id: string, data: { status?: string; notes?: string }) {
    return prisma.demoRequest.update({ where: { id }, data });
  },

  async getStats() {
    const [total, newCount, contacted, converted, closed] = await Promise.all([
      prisma.demoRequest.count(),
      prisma.demoRequest.count({ where: { status: 'new' } }),
      prisma.demoRequest.count({ where: { status: 'contacted' } }),
      prisma.demoRequest.count({ where: { status: 'converted' } }),
      prisma.demoRequest.count({ where: { status: 'closed' } }),
    ]);
    return { total, new: newCount, contacted, converted, closed };
  },
};
