import { customerRepository } from './customer.repository';
import { AppError } from '../../middleware/errorHandler';

export const customerService = {
  async list(params: { page: number; limit: number; search?: string }) {
    return customerRepository.findAll(params);
  },

  async getById(id: string) {
    const customer = await customerRepository.findById(id);
    if (!customer) throw new AppError('Customer not found', 404);
    return customer;
  },

  async create(data: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    gstin?: string;
    storeId?: string;
  }) {
    if (data.phone) {
      const existing = await customerRepository.findByPhone(data.phone);
      if (existing) throw new AppError('A customer with this phone number already exists', 409);
    }
    if (data.email) {
      const existing = await customerRepository.findByEmail(data.email);
      if (existing) throw new AppError('A customer with this email already exists', 409);
    }
    return customerRepository.create(data);
  },

  async update(id: string, data: any) {
    const customer = await customerRepository.findById(id);
    if (!customer) throw new AppError('Customer not found', 404);
    if (data.phone && data.phone !== customer.phone) {
      const existing = await customerRepository.findByPhone(data.phone, id);
      if (existing) throw new AppError('A customer with this phone number already exists', 409);
    }
    if (data.email && data.email !== customer.email) {
      const existing = await customerRepository.findByEmail(data.email, id);
      if (existing) throw new AppError('A customer with this email already exists', 409);
    }
    return customerRepository.update(id, data);
  },

  async delete(id: string) {
    const customer = await customerRepository.findById(id);
    if (!customer) throw new AppError('Customer not found', 404);
    await customerRepository.softDelete(id);
  },
};
