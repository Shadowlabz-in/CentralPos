import slugify from '../product/slugify';
import { colorRepository } from './color.repository';
import { AppError } from '../../middleware/errorHandler';

export const colorService = {
  async list(storeId?: string) {
    return colorRepository.findAll(storeId);
  },

  async getById(id: string) {
    const color = await colorRepository.findById(id);
    if (!color) throw new AppError('Color not found', 404);
    return color;
  },

  async create(data: { name: string; hex?: string; storeId?: string }) {
    const existing = await colorRepository.findByName(data.name, data.storeId);
    if (existing) throw new AppError('A color with this name already exists', 409);
    const slug = slugify(data.name);
    const existingSlug = await colorRepository.findBySlug(slug);
    if (existingSlug) throw new AppError('A color with this name already exists', 409);
    return colorRepository.create({ ...data, slug });
  },

  async update(id: string, data: { name?: string; hex?: string }) {
    const color = await colorRepository.findById(id);
    if (!color) throw new AppError('Color not found', 404);
    const updateData: any = { ...data };
    if (data.name) {
      const slug = slugify(data.name);
      const existingSlug = await colorRepository.findBySlug(slug);
      if (existingSlug && existingSlug.id !== id) throw new AppError('A color with this name already exists', 409);
      updateData.slug = slug;
    }
    return colorRepository.update(id, updateData);
  },

  async delete(id: string) {
    const color = await colorRepository.findById(id);
    if (!color) throw new AppError('Color not found', 404);
    await colorRepository.softDelete(id);
  },
};
