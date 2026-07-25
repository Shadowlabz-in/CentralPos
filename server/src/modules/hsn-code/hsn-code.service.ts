import { hsnCodeRepository } from './hsn-code.repository';
import { AppError } from '../../middleware/errorHandler';

export const hsnCodeService = {
  async list(storeId?: string) {
    const codes = await hsnCodeRepository.findAll(storeId);
    return codes.map((c) => ({
      id: c.id,
      code: c.code,
      description: c.description,
      productCount: c._count.products,
      storeId: c.storeId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  },

  async getById(id: string) {
    const code = await hsnCodeRepository.findById(id);
    if (!code) throw new AppError('HSN code not found', 404);
    return code;
  },

  async create(data: { code: string; description?: string; storeId?: string }) {
    const existing = await hsnCodeRepository.findByCode(data.code);
    if (existing) throw new AppError('An HSN code with this value already exists', 409);
    return hsnCodeRepository.create(data);
  },

  async update(id: string, data: { code?: string; description?: string }) {
    const code = await hsnCodeRepository.findById(id);
    if (!code) throw new AppError('HSN code not found', 404);
    if (data.code) {
      const existing = await hsnCodeRepository.findByCode(data.code);
      if (existing && existing.id !== id) throw new AppError('An HSN code with this value already exists', 409);
    }
    return hsnCodeRepository.update(id, data);
  },

  async delete(id: string) {
    const code = await hsnCodeRepository.findById(id);
    if (!code) throw new AppError('HSN code not found', 404);
    if (code._count.products > 0) throw new AppError('Cannot delete HSN code with associated products', 400);
    await hsnCodeRepository.softDelete(id);
  },
};
