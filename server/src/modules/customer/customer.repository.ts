import prisma from '../../utils/prisma';

export const customerRepository = {
  async findAll(params: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = params;
    const where: any = { deletedAt: null };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ]);
    return { data, total };
  },

  async findById(id: string) {
    return prisma.customer.findFirst({ where: { id, deletedAt: null } });
  },

  async findByPhone(phone: string, excludeId?: string) {
    const where: any = { phone, deletedAt: null };
    if (excludeId) where.id = { not: excludeId };
    return prisma.customer.findFirst({ where });
  },

  async findByEmail(email: string, excludeId?: string) {
    const where: any = { email, deletedAt: null };
    if (excludeId) where.id = { not: excludeId };
    return prisma.customer.findFirst({ where });
  },

  async create(data: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    gstin?: string;
    storeId?: string;
  }) {
    return prisma.customer.create({ data });
  },

  async update(id: string, data: any) {
    return prisma.customer.update({ where: { id }, data });
  },

  async softDelete(id: string) {
    return prisma.customer.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};
