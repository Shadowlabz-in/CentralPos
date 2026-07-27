import prisma from '../../utils/prisma';
import { storeRepository } from './store.repository';
import { AppError } from '../../middleware/errorHandler';

export const storeService = {
  async list(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [stores, total] = await Promise.all([
      storeRepository.findAll(skip, limit),
      storeRepository.countAll(),
    ]);

    return {
      data: stores.map((s) => ({
        id: s.id,
        name: s.name,
        code: s.code,
        ownerId: s.ownerId,
        owner: s.owner,
        ownerName: s.ownerName,
        panNumber: s.panNumber,
        address: s.address,
        city: s.city,
        state: s.state,
        pincode: s.pincode,
        phone: s.phone,
        email: s.email,
        website: s.website,
        gstin: s.gstin,
        logo: s.logo,
        currency: s.currency,
        timezone: s.timezone,
        language: s.language,
        financialYear: s.financialYear,
        isActive: s.isActive,
        userCount: s._count.users,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string) {
    const store = await storeRepository.findById(id);
    if (!store) throw new AppError('Store not found', 404);
    return {
      id: store.id,
      name: store.name,
      code: store.code,
      ownerId: store.ownerId,
      owner: store.owner,
      ownerName: store.ownerName,
      panNumber: store.panNumber,
      address: store.address,
      city: store.city,
      state: store.state,
      pincode: store.pincode,
      phone: store.phone,
      email: store.email,
      website: store.website,
      gstin: store.gstin,
      logo: store.logo,
      currency: store.currency,
      timezone: store.timezone,
      language: store.language,
      financialYear: store.financialYear,
      isActive: store.isActive,
      userCount: store._count.users,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
    };
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
    const existing = await prisma.store.findUnique({ where: { code: data.code } });
    if (existing) throw new AppError(`Store with code '${data.code}' already exists`, 409);
    const store = await storeRepository.create(data);
    if (data.ownerId) {
      await prisma.user.update({ where: { id: data.ownerId }, data: { storeId: store.id } });
    }
    return store;
  },

  async update(id: string, data: any) {
    const existing = await storeRepository.findById(id);
    if (!existing) throw new AppError('Store not found', 404);
    if (data.ownerId) {
      await prisma.user.update({ where: { id: data.ownerId }, data: { storeId: id } });
    }
    // Clear previous owner's storeId if owner changed
    if (data.ownerId !== undefined && data.ownerId !== existing.ownerId && existing.ownerId) {
      await prisma.user.update({ where: { id: existing.ownerId }, data: { storeId: null } });
    }
    return storeRepository.update(id, data);
  },

  async delete(id: string) {
    const existing = await storeRepository.findById(id);
    if (!existing) throw new AppError('Store not found', 404);
    await storeRepository.softDelete(id);
  },
};
