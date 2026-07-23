import { supplierRepository } from './supplier.repository';
import { AppError } from '../../middleware/errorHandler';

export const supplierService = {
  async list(storeId?: string) {
    const suppliers = await supplierRepository.findAll(storeId);
    return suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      contactPerson: s.contactPerson,
      phone: s.phone,
      email: s.email,
      address: s.address,
      city: s.city,
      state: s.state,
      pincode: s.pincode,
      gstin: s.gstin,
      isActive: s.isActive,
      storeId: s.storeId,
      purchaseCount: s._count.purchases,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  },

  async getById(id: string) {
    const supplier = await supplierRepository.findById(id);
    if (!supplier) throw new AppError('Supplier not found', 404);
    return supplier;
  },

  async create(data: {
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    gstin?: string;
    storeId?: string;
  }) {
    if (data.phone) {
      const existing = await supplierRepository.findByPhone(data.phone);
      if (existing) throw new AppError('A supplier with this phone number already exists', 409);
    }

    if (data.gstin) {
      const existing = await supplierRepository.findByGstin(data.gstin);
      if (existing) throw new AppError('A supplier with this GSTIN already exists', 409);
    }

    return supplierRepository.create(data);
  },

  async update(
    id: string,
    data: {
      name?: string;
      contactPerson?: string;
      phone?: string;
      email?: string;
      address?: string;
      city?: string;
      state?: string;
      pincode?: string;
      gstin?: string;
      isActive?: boolean;
    },
  ) {
    const supplier = await supplierRepository.findById(id);
    if (!supplier) throw new AppError('Supplier not found', 404);

    if (data.phone && data.phone !== supplier.phone) {
      const existing = await supplierRepository.findByPhone(data.phone, id);
      if (existing) throw new AppError('A supplier with this phone number already exists', 409);
    }

    if (data.gstin && data.gstin !== supplier.gstin) {
      const existing = await supplierRepository.findByGstin(data.gstin, id);
      if (existing) throw new AppError('A supplier with this GSTIN already exists', 409);
    }

    return supplierRepository.update(id, data);
  },

  async delete(id: string) {
    const supplier = await supplierRepository.findById(id);
    if (!supplier) throw new AppError('Supplier not found', 404);

    if (supplier._count.purchases > 0) {
      throw new AppError('Cannot delete supplier with purchase history. Deactivate instead.', 400);
    }

    await supplierRepository.softDelete(id);
  },
};
