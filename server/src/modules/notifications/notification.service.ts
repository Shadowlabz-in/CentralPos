import prisma from '../../utils/prisma';

export const notificationService = {
  async list(userId: string, page: number, limit: number) {
    const where = { userId };
    const [data, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { ...where, isRead: false } }),
    ]);
    return { data, total, unreadCount };
  },

  async markAsRead(userId: string, notificationId: string) {
    return prisma.notification.update({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  },

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },

  async getSettings(userId: string) {
    let settings = await prisma.notificationSetting.findUnique({ where: { userId } });
    if (!settings) {
      settings = await prisma.notificationSetting.create({ data: { userId } });
    }
    return settings;
  },

  async updateSettings(userId: string, data: any) {
    await this.getSettings(userId);
    return prisma.notificationSetting.update({ where: { userId }, data });
  },
};
