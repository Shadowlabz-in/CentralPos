import slugify from '../product/slugify';
import { categoryRepository } from './category.repository';
import { AppError } from '../../middleware/errorHandler';

export const categoryService = {
  async list(storeId?: string) {
    const categories = await categoryRepository.findAll(storeId);
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      parentId: c.parentId,
      parent: c.parent,
      productCount: c._count.products,
      childCount: c._count.children,
      storeId: c.storeId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  },

  async getById(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new AppError('Category not found', 404);
    return category;
  },

  async create(data: { name: string; description?: string; parentId?: string; storeId?: string }) {
    const existing = await categoryRepository.findByName(data.name, data.storeId);
    if (existing) throw new AppError('A category with this name already exists', 409);

    if (data.parentId) {
      const parent = await categoryRepository.findById(data.parentId);
      if (!parent) throw new AppError('Parent category not found', 404);
    }

    const slug = slugify(data.name);
    const existingSlug = await categoryRepository.findBySlug(slug);
    if (existingSlug) throw new AppError('A category with this name already exists', 409);

    return categoryRepository.create({ ...data, slug });
  },

  async update(
    id: string,
    data: { name?: string; description?: string; parentId?: string | null },
  ) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new AppError('Category not found', 404);

    if (data.parentId) {
      if (data.parentId === id) throw new AppError('A category cannot be its own parent', 400);

      const parent = await categoryRepository.findById(data.parentId);
      if (!parent) throw new AppError('Parent category not found', 404);
    }

    if (data.name && data.name !== category.name) {
      const existing = await categoryRepository.findByName(
        data.name,
        category.storeId || undefined,
      );
      if (existing && existing.id !== id)
        throw new AppError('A category with this name already exists', 409);
    }

    const updateData: any = { ...data };
    if (data.name) {
      updateData.slug = slugify(data.name);
    }

    return categoryRepository.update(id, updateData);
  },

  async delete(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new AppError('Category not found', 404);

    if (category._count.products > 0) {
      throw new AppError(
        'Cannot delete category with associated products. Remove or reassign products first.',
        400,
      );
    }

    await categoryRepository.softDelete(id);
  },
};
