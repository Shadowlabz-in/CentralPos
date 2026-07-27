import prisma from '../../utils/prisma';

export const storeRepository = {
  async findAll(skip?: number, take?: number) {
    return prisma.store.findMany({
      where: { deletedAt: null },
      skip,
      take,
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        _count: { select: { users: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async countAll() {
    return prisma.store.count({ where: { deletedAt: null } });
  },

  async findById(id: string) {
    return prisma.store.findFirst({
      where: { id, deletedAt: null },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        _count: { select: { users: true } },
      },
    });
  },

  async create(data: {
    name: string;
    code: string;
    ownerId?: string | null;
    ownerName?: string | null;
    panNumber?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    gstin?: string | null;
    logo?: string | null;
    currency?: string;
    timezone?: string;
    language?: string;
    financialYear?: string | null;
  }) {
    return prisma.store.create({
      data,
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        _count: { select: { users: true } },
      },
    });
  },

  async update(
    id: string,
    data: {
      name?: string;
      code?: string;
      ownerId?: string | null;
      ownerName?: string | null;
      panNumber?: string | null;
      address?: string | null;
      city?: string | null;
      state?: string | null;
      pincode?: string | null;
      phone?: string | null;
      email?: string | null;
      website?: string | null;
      gstin?: string | null;
      logo?: string | null;
      currency?: string;
      timezone?: string;
      language?: string;
      financialYear?: string | null;
      isActive?: boolean;
    },
  ) {
    return prisma.store.update({
      where: { id },
      data,
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        _count: { select: { users: true } },
      },
    });
  },

  async softDelete(id: string) {
    return prisma.store.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
