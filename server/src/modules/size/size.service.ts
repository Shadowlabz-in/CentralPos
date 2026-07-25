import slugify from '../product/slugify';
import { sizeRepository } from './size.repository';
import { AppError } from '../../middleware/errorHandler';

export const sizeService = {
  async list(storeId?: string) {
    return sizeRepository.findAll(storeId);
  },

  async getById(id: string) {
    const size = await sizeRepository.findById(id);
    if (!size) throw new AppError('Size not found', 404);
    return size;
  },

  async create(data: { name: string; sortOrder?: number; storeId?: string }) {
    const existing = await sizeRepository.findByName(data.name, data.storeId);
    if (existing) throw new AppError('A size with this name already exists', 409);
    const slug = slugify(data.name);
    const existingSlug = await sizeRepository.findBySlug(slug);
    if (existingSlug) throw new AppError('A size with this name already exists', 409);
    return sizeRepository.create({ ...data, slug });
  },

  async update(id: string, data: { name?: string; sortOrder?: number }) {
    const size = await sizeRepository.findById(id);
    if (!size) throw new AppError('Size not found', 404);
    const updateData: any = { ...data };
    if (data.name) {
      const slug = slugify(data.name);
      const existingSlug = await sizeRepository.findBySlug(slug);
      if (existingSlug && existingSlug.id !== id) throw new AppError('A size with this name already exists', 409);
      updateData.slug = slug;
    }
    return sizeRepository.update(id, updateData);
  },

  async delete(id: string) {
    const size = await sizeRepository.findById(id);
    if (!size) throw new AppError('Size not found', 404);
    await sizeRepository.softDelete(id);
  },
};
