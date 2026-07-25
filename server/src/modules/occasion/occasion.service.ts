import slugify from '../product/slugify';
import { occasionRepository } from './occasion.repository';
import { AppError } from '../../middleware/errorHandler';

export const occasionService = {
  async list(storeId?: string) {
    const occasions = await occasionRepository.findAll(storeId);
    return occasions.map((o) => ({
      id: o.id,
      name: o.name,
      slug: o.slug,
      description: o.description,
      productCount: o._count.products,
      storeId: o.storeId,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    }));
  },

  async getById(id: string) {
    const occasion = await occasionRepository.findById(id);
    if (!occasion) throw new AppError('Occasion not found', 404);
    return occasion;
  },

  async create(data: { name: string; description?: string; storeId?: string }) {
    const existing = await occasionRepository.findByName(data.name, data.storeId);
    if (existing) throw new AppError('An occasion with this name already exists', 409);
    const slug = slugify(data.name);
    const existingSlug = await occasionRepository.findBySlug(slug);
    if (existingSlug) throw new AppError('An occasion with this name already exists', 409);
    return occasionRepository.create({ ...data, slug });
  },

  async update(id: string, data: { name?: string; description?: string }) {
    const occasion = await occasionRepository.findById(id);
    if (!occasion) throw new AppError('Occasion not found', 404);
    const updateData: any = { ...data };
    if (data.name) {
      const slug = slugify(data.name);
      const existingSlug = await occasionRepository.findBySlug(slug);
      if (existingSlug && existingSlug.id !== id) throw new AppError('An occasion with this name already exists', 409);
      updateData.slug = slug;
    }
    return occasionRepository.update(id, updateData);
  },

  async delete(id: string) {
    const occasion = await occasionRepository.findById(id);
    if (!occasion) throw new AppError('Occasion not found', 404);
    if (occasion._count.products > 0) throw new AppError('Cannot delete occasion with associated products', 400);
    await occasionRepository.softDelete(id);
  },
};
