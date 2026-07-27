import { roleRepository } from './role.repository';
import { RolePermissions } from '../../config/permissions';
import { AppError } from '../../middleware/errorHandler';

function resolvePermissions(role: { name: string; permissions: string[] }): string[] {
  if (role.permissions && role.permissions.length > 0) return role.permissions;
  return RolePermissions[role.name] || [];
}

export const roleService = {
  async list() {
    const roles = await roleRepository.findAll();
    return roles.map((r) => ({
      id: r.id,
      name: r.name,
      label: r.label,
      description: r.description || null,
      permissions: resolvePermissions(r),
      userCount: 0,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  },

  async getById(id: string) {
    const role = await roleRepository.findById(id);
    if (!role) throw new AppError('Role not found', 404);
    return {
      id: role.id,
      name: role.name,
      label: role.label,
      description: role.description || null,
      permissions: resolvePermissions(role),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  },

  async create(data: { name: string; label: string; description?: string; permissions?: string[] }) {
    const existing = await roleRepository.findByName(data.name);
    if (existing) throw new AppError('A role with this name already exists', 409);
    const role = await roleRepository.create({
      ...data,
      description: data.description || undefined,
    });
    return {
      id: role.id,
      name: role.name,
      label: role.label,
      description: role.description || null,
      permissions: resolvePermissions(role),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  },

  async update(id: string, data: { name?: string; label?: string; description?: string; permissions?: string[] }) {
    const existing = await roleRepository.findById(id);
    if (!existing) throw new AppError('Role not found', 404);
    if (data.name && data.name !== existing.name) {
      const duplicate = await roleRepository.findByName(data.name);
      if (duplicate) throw new AppError('A role with this name already exists', 409);
    }
    const role = await roleRepository.update(id, {
      ...data,
      description: data.description !== undefined ? (data.description || undefined) : undefined,
    });
    return {
      id: role.id,
      name: role.name,
      label: role.label,
      description: role.description || null,
      permissions: resolvePermissions(role),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  },

  async delete(id: string) {
    const existing = await roleRepository.findById(id);
    if (!existing) throw new AppError('Role not found', 404);
    if (existing.name === 'SUPER_ADMIN') throw new AppError('Cannot delete SUPER_ADMIN role', 400);
    await roleRepository.delete(id);
  },
};
