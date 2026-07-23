import prisma from '../../utils/prisma';

export const preferenceService = {
  async get(userId: string) {
    let pref = await prisma.userPreference.findUnique({ where: { userId } });
    if (!pref) {
      pref = await prisma.userPreference.create({ data: { userId } });
    }
    return pref;
  },

  async update(userId: string, data: any) {
    await this.get(userId);
    return prisma.userPreference.update({ where: { userId }, data });
  },
};
