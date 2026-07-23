import slugify from '../product/slugify';
import { brandRepository } from './brand.repository';
import { AppError } from '../../middleware/errorHandler';

export const brandService = {
  async list(storeId?: string) {
    const brands = await brandRepository.findAll(storeId);
    return brands.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      description: b.description,
      productCount: b._count.products,
      storeId: b.storeId,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    }));
  },

  async getById(id: string) {
    const brand = await brandRepository.findById(id);
    if (!brand) throw new AppError('Brand not found', 404);
    return brand;
  },

  async create(data: { name: string; description?: string; storeId?: string }) {
    const existing = await brandRepository.findByName(data.name, data.storeId);
    if (existing) throw new AppError('A brand with this name already exists', 409);

    const slug = slugify(data.name);
    const existingSlug = await brandRepository.findBySlug(slug);
    if (existingSlug) throw new AppError('A brand with this name already exists', 409);

    return brandRepository.create({ ...data, slug });
  },

  async update(id: string, data: { name?: string; description?: string }) {
    const brand = await brandRepository.findById(id);
    if (!brand) throw new AppError('Brand not found', 404);

    if (data.name && data.name !== brand.name) {
      const existing = await brandRepository.findByName(data.name, brand.storeId || undefined);
      if (existing && existing.id !== id)
        throw new AppError('A brand with this name already exists', 409);
    }

    const updateData: any = { ...data };
    if (data.name) {
      updateData.slug = slugify(data.name);
    }

    return brandRepository.update(id, updateData);
  },

  async delete(id: string) {
    const brand = await brandRepository.findById(id);
    if (!brand) throw new AppError('Brand not found', 404);

    if (brand._count.products > 0) {
      throw new AppError(
        'Cannot delete brand with associated products. Remove or reassign products first.',
        400,
      );
    }

    await brandRepository.softDelete(id);
  },
};
