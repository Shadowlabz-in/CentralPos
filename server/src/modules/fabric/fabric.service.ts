import slugify from '../product/slugify';
import { fabricRepository } from './fabric.repository';
import { AppError } from '../../middleware/errorHandler';

export const fabricService = {
  async list(storeId?: string) {
    const fabrics = await fabricRepository.findAll(storeId);
    return fabrics.map((f) => ({
      id: f.id,
      name: f.name,
      slug: f.slug,
      description: f.description,
      productCount: f._count.products,
      storeId: f.storeId,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
    }));
  },

  async getById(id: string) {
    const fabric = await fabricRepository.findById(id);
    if (!fabric) throw new AppError('Fabric not found', 404);
    return fabric;
  },

  async create(data: { name: string; description?: string; storeId?: string }) {
    const existing = await fabricRepository.findByName(data.name, data.storeId);
    if (existing) throw new AppError('A fabric with this name already exists', 409);
    const slug = slugify(data.name);
    const existingSlug = await fabricRepository.findBySlug(slug);
    if (existingSlug) throw new AppError('A fabric with this name already exists', 409);
    return fabricRepository.create({ ...data, slug });
  },

  async update(id: string, data: { name?: string; description?: string }) {
    const fabric = await fabricRepository.findById(id);
    if (!fabric) throw new AppError('Fabric not found', 404);
    const updateData: any = { ...data };
    if (data.name) {
      const slug = slugify(data.name);
      const existingSlug = await fabricRepository.findBySlug(slug);
      if (existingSlug && existingSlug.id !== id) throw new AppError('A fabric with this name already exists', 409);
      updateData.slug = slug;
    }
    return fabricRepository.update(id, updateData);
  },

  async delete(id: string) {
    const fabric = await fabricRepository.findById(id);
    if (!fabric) throw new AppError('Fabric not found', 404);
    if (fabric._count.products > 0) throw new AppError('Cannot delete fabric with associated products', 400);
    await fabricRepository.softDelete(id);
  },
};
