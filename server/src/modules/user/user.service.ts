import { userRepository } from './user.repository';
import { hashPassword } from '../../utils/password';
import { AppError } from '../../middleware/errorHandler';
import { getPermissionsForRoles } from '../../config/permissions';
import prisma from '../../utils/prisma';

export const userService = {
  async list(page = 1, limit = 10, storeId?: string, search?: string) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      userRepository.findAll(skip, limit, storeId, search),
      search
        ? userRepository.countSearch(storeId, search)
        : (storeId ? userRepository.countByStore(storeId) : userRepository.countAll()),
    ]);

    return {
      data: users.map((u) => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        isActive: u.isActive,
        storeId: u.storeId,
        store: u.store,
        roles: u.userRoles.map((ur) => ur.role.name),
        customPermissions: u.customPermissions,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      isActive: user.isActive,
      storeId: user.storeId,
      store: user.store,
      roles: user.userRoles.map((ur) => ur.role.name),
      customPermissions: user.customPermissions,
      permissions: getPermissionsForRoles(user.userRoles.map((ur) => ur.role.name), user.customPermissions),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      isActive: user.isActive,
      storeId: user.storeId,
      store: user.store,
      roles: user.userRoles.map((ur) => ur.role.name),
      customPermissions: user.customPermissions,
      permissions: getPermissionsForRoles(user.userRoles.map((ur) => ur.role.name), user.customPermissions),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },

  async create(data: {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
    storeId?: string;
    createdById: string;
    permissions?: string[];
  }) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('A user with this email already exists', 409);
    }

    const roleRecord = await userRepository.findRoleByName(data.role);
    if (!roleRecord) {
      throw new AppError(`Role '${data.role}' not found`, 400);
    }

    const passwordHash = await hashPassword(data.password);

    let user;
    try {
      user = await userRepository.create({
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        storeId: data.storeId,
        createdById: data.createdById,
        customPermissions: data.permissions,
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        const conflicted = await prisma.user.findUnique({ where: { email: data.email } });
        if (conflicted && conflicted.deletedAt) {
          await userRepository.hardDelete(conflicted.id);
          user = await userRepository.create({
            email: data.email,
            passwordHash,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            storeId: data.storeId,
            createdById: data.createdById,
            customPermissions: data.permissions,
          });
        } else {
          throw new AppError('A user with this email already exists', 409);
        }
      } else {
        throw err;
      }
    }

    await userRepository.assignRole(user.id, roleRecord.id);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      isActive: user.isActive,
      storeId: user.storeId,
      role: data.role,
      customPermissions: user.customPermissions,
    };
  },

  async update(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      isActive?: boolean;
      role?: string;
      storeId?: string | null;
      permissions?: string[];
    },
    currentUserId: string,
  ) {
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new AppError('User not found', 404);
    }

    if (data.email && data.email !== existingUser.email) {
      const emailUser = await userRepository.findByEmail(data.email);
      if (emailUser) {
        throw new AppError('A user with this email already exists', 409);
      }
    }

    if (data.role) {
      const roleRecord = await userRepository.findRoleByName(data.role);
      if (!roleRecord) {
        throw new AppError(`Role '${data.role}' not found`, 400);
      }
      await userRepository.removeRoles(id);
      await userRepository.assignRole(id, roleRecord.id);
    }

    const updateData: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      isActive?: boolean;
      storeId?: string | null;
      customPermissions?: string[];
    } = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.storeId !== undefined) updateData.storeId = data.storeId;
    if (data.permissions !== undefined) updateData.customPermissions = data.permissions;

    if (Object.keys(updateData).length > 0) {
      try {
        await userRepository.update(id, updateData);
      } catch (err: any) {
        if (err?.code === 'P2002') {
          const conflicted = await prisma.user.findUnique({ where: { email: data.email } });
          if (conflicted && conflicted.deletedAt) {
            await userRepository.hardDelete(conflicted.id);
            await userRepository.update(id, updateData);
          } else {
            throw new AppError('A user with this email already exists', 409);
          }
        } else {
          throw err;
        }
      }
    }

    return this.getById(id);
  },

  async delete(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new AppError('Cannot delete your own account', 400);
    }

    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await userRepository.softDelete(id);
  },

  async purge(id: string, currentUserId: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return userRepository.hardDelete(id);
  },
};
