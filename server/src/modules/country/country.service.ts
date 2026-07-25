import slugify from '../product/slugify';
import { countryRepository } from './country.repository';
import { AppError } from '../../middleware/errorHandler';

export const countryService = {
  async list(storeId?: string) {
    const countries = await countryRepository.findAll(storeId);
    return countries.map((c) => ({
      id: c.id,
      name: c.name,
      code: c.code,
      slug: c.slug,
      productCount: c._count.products,
      storeId: c.storeId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  },

  async getById(id: string) {
    const country = await countryRepository.findById(id);
    if (!country) throw new AppError('Country not found', 404);
    return country;
  },

  async create(data: { name: string; code: string; storeId?: string }) {
    const existingCode = await countryRepository.findByCode(data.code);
    if (existingCode) throw new AppError('A country with this code already exists', 409);
    const existingName = await countryRepository.findByName(data.name, data.storeId);
    if (existingName) throw new AppError('A country with this name already exists', 409);
    const slug = slugify(data.name);
    const existingSlug = await countryRepository.findBySlug(slug);
    if (existingSlug) throw new AppError('A country with this name already exists', 409);
    return countryRepository.create({ ...data, slug });
  },

  async update(id: string, data: { name?: string; code?: string }) {
    const country = await countryRepository.findById(id);
    if (!country) throw new AppError('Country not found', 404);
    if (data.code) {
      const existing = await countryRepository.findByCode(data.code);
      if (existing && existing.id !== id) throw new AppError('A country with this code already exists', 409);
    }
    const updateData: any = { ...data };
    if (data.name) {
      const slug = slugify(data.name);
      const existingSlug = await countryRepository.findBySlug(slug);
      if (existingSlug && existingSlug.id !== id) throw new AppError('A country with this name already exists', 409);
      updateData.slug = slug;
    }
    return countryRepository.update(id, updateData);
  },

  async delete(id: string) {
    const country = await countryRepository.findById(id);
    if (!country) throw new AppError('Country not found', 404);
    if (country._count.products > 0) throw new AppError('Cannot delete country with associated products', 400);
    await countryRepository.softDelete(id);
  },
};
