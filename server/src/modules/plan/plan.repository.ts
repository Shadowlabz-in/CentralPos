import prisma from '../../utils/prisma';

export const planRepository = {
  async findAll(activeOnly = false) {
    return prisma.pricingPlan.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { sortOrder: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.pricingPlan.findUnique({ where: { id } });
  },

  async findByCode(code: string) {
    return prisma.pricingPlan.findUnique({ where: { code } });
  },

  async create(data: any) {
    return prisma.pricingPlan.create({ data });
  },

  async update(id: string, data: any) {
    return prisma.pricingPlan.update({ where: { id }, data });
  },

  async delete(id: string) {
    await prisma.storeSubscription.deleteMany({ where: { planId: id } });
    return prisma.pricingPlan.delete({ where: { id } });
  },

  async findSubscription(storeId: string) {
    return prisma.storeSubscription.findUnique({
      where: { storeId },
      include: { plan: true },
    });
  },

  async upsertSubscription(storeId: string, data: {
    planId: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    trialEndsAt?: Date;
    autoRenew?: boolean;
    notes?: string;
  }) {
    return prisma.storeSubscription.upsert({
      where: { storeId },
      create: { storeId, ...data },
      update: data,
      include: { plan: true },
    });
  },

  async removeSubscription(storeId: string) {
    return prisma.storeSubscription.delete({ where: { storeId } });
  },

  async getSubscriptionMetrics(storeId: string) {
    const [userCount, productCount] = await Promise.all([
      prisma.user.count({ where: { storeId, deletedAt: null } }),
      prisma.product.count({
        where: {
          variants: { some: { storeId, deletedAt: null } },
          deletedAt: null,
        },
      }),
    ]);
    return { userCount, productCount };
  },
};
