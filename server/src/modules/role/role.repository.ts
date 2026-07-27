import prisma from '../../utils/prisma';

export const roleRepository = {
  async findAll() {
    return prisma.role.findMany({
      orderBy: { name: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.role.findUnique({ where: { id } });
  },

  async findByName(name: string) {
    return prisma.role.findUnique({ where: { name } });
  },

  async create(data: { name: string; label: string; description?: string; permissions?: string[] }) {
    return prisma.role.create({ data });
  },

  async update(id: string, data: { name?: string; label?: string; description?: string; permissions?: string[] }) {
    return prisma.role.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.role.delete({ where: { id } });
  },
};
