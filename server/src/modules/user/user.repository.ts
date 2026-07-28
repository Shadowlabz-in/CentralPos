import prisma from '../../utils/prisma';

export const userRepository = {
  async findAll(skip?: number, take?: number, storeId?: string, search?: string) {
    return prisma.user.findMany({
      where: {
        deletedAt: null,
        ...(storeId ? { storeId } : {}),
        ...(storeId ? { userRoles: { none: { role: { name: 'SUPER_ADMIN' } } } } : {}),
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      skip,
      take,
      include: {
        userRoles: {
          include: { role: true },
        },
        store: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async countAll() {
    return prisma.user.count({
      where: { deletedAt: null },
    });
  },

  async countByStore(storeId: string) {
    return prisma.user.count({
      where: { deletedAt: null, storeId, userRoles: { none: { role: { name: 'SUPER_ADMIN' } } } },
    });
  },

  async countSearch(storeId?: string, search?: string) {
    return prisma.user.count({
      where: {
        deletedAt: null,
        ...(storeId ? { storeId } : {}),
        ...(storeId ? { userRoles: { none: { role: { name: 'SUPER_ADMIN' } } } } : {}),
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
    });
  },

  async findById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        userRoles: {
          include: { role: true },
        },
        store: { select: { id: true, name: true, code: true } },
      },
    });
  },

  async findByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });
  },

  async create(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName?: string;
    phone?: string;
    storeId?: string;
    createdById?: string;
    customPermissions?: string[];
  }) {
    return prisma.user.create({
      data,
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });
  },

  async update(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      isActive?: boolean;
      storeId?: string | null;
      customPermissions?: string[];
    },
  ) {
    return prisma.user.update({
      where: { id },
      data,
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });
  },

  async softDelete(id: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async hardDelete(id: string) {
    await prisma.userRole.deleteMany({ where: { userId: id } });
    await prisma.refreshToken.deleteMany({ where: { userId: id } });
    return prisma.user.delete({ where: { id } });
  },

  async assignRole(userId: string, roleId: string) {
    return prisma.userRole.create({
      data: { userId, roleId },
    });
  },

  async removeRoles(userId: string) {
    return prisma.userRole.deleteMany({
      where: { userId },
    });
  },

  async findRoleByName(name: string) {
    return prisma.role.findUnique({ where: { name } });
  },

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
    });
  },

  async createRefreshToken(data: { token: string; userId: string; expiresAt: Date }) {
    return prisma.refreshToken.create({ data });
  },

  async deleteRefreshToken(token: string) {
    return prisma.refreshToken.deleteMany({
      where: { token },
    });
  },

  async deleteUserRefreshTokens(userId: string) {
    return prisma.refreshToken.deleteMany({
      where: { userId },
    });
  },

  async updatePassword(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  },
};
