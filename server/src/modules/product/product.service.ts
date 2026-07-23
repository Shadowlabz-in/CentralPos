import slugify from './slugify';
import { productRepository, ProductFilters } from './product.repository';
import { variantRepository } from '../variant/variant.repository';
import { AppError } from '../../middleware/errorHandler';
import { generateSku, generateBarcode } from '../../utils/sku';
import prisma from '../../utils/prisma';

async function generateBarcodeImage(variantId: string, barcodeValue: string) {
  try {
    const bwipjs = require('bwip-js');
    const path = require('path');
    const fs = require('fs/promises');
    const BARCODE_DIR = path.resolve(__dirname, '../../../uploads/barcodes');
    await fs.mkdir(BARCODE_DIR, { recursive: true });
    const filename = `barcode-${variantId}.png`;
    const filePath = path.join(BARCODE_DIR, filename);
    const png = await bwipjs.toBuffer({
      bcid: 'code128',
      text: barcodeValue,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: 'center',
    });
    await fs.writeFile(filePath, png);
    const imageUrl = `/uploads/barcodes/${filename}`;
    await prisma.productVariant.update({
      where: { id: variantId },
      data: { barcodeImagePath: imageUrl },
    });
  } catch {
    /* barcode image generation is non-critical */
  }
}

function mapVariant(v: any) {
  if (!v) return v;
  return {
    ...v,
    purchasePrice: Number(v.purchasePrice),
    sellingPrice: Number(v.sellingPrice),
    mrp: v.mrp ? Number(v.mrp) : null,
  };
}

export const productService = {
  async list(filters: ProductFilters & { page: number; limit: number }) {
    const { page, limit, ...restFilters } = filters;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      productRepository.findAll(skip, limit, restFilters),
      productRepository.countAll(restFilters),
    ]);

    return {
      data: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        tags: p.tags,
        isActive: p.isActive,
        category: p.category,
        brand: p.brand,
        images: p.images,
        variants: (p.variants || []).map(mapVariant),
        variantCount: p._count.variants,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new AppError('Product not found', 404);
    return {
      ...product,
      variants: (product.variants || []).map(mapVariant),
      images: product.images || [],
    };
  },

  async create(data: {
    name: string;
    description?: string;
    tags?: string[];
    categoryId: string;
    brandId?: string | null;
    isActive?: boolean;
  }) {
    const slug = slugify(data.name);
    const existingSlug = await productRepository.findBySlug(slug);
    if (existingSlug) throw new AppError('A product with this name already exists', 409);

    return productRepository.create({ ...data, slug, isActive: data.isActive ?? true });
  },

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      tags?: string[];
      categoryId?: string;
      brandId?: string | null;
      isActive?: boolean;
    },
  ) {
    const product = await productRepository.findById(id);
    if (!product) throw new AppError('Product not found', 404);

    const updateData: any = { ...data };
    if (data.name && data.name !== product.name) {
      updateData.slug = slugify(data.name);
    }

    return productRepository.update(id, updateData);
  },

  async createWithVariants(
    data: {
      name: string;
      description?: string;
      categoryId: string;
      brandId?: string | null;
      supplierId?: string | null;
      purchasePrice?: number;
      sellingPrice?: number;
      mrp?: number;
      gstPercentage: number;
      isActive?: boolean;
      variants: Array<{
        size?: string;
        color?: string;
        fabric?: string;
        sku?: string;
        barcode?: string;
        purchasePrice?: number;
        sellingPrice?: number;
        mrp?: number;
        gstPercentage?: number;
        initialStock: number;
        reorderLevel: number;
        rackLocation?: string;
      }>;
    },
    userId?: string,
    storeId?: string,
  ) {
    const slug = slugify(data.name);
    const existingSlug = await productRepository.findBySlug(slug);
    if (existingSlug) throw new AppError('A product with this name already exists', 409);

    const product = await prisma.$transaction(async (tx) => {
      const product = await productRepository.create({
        name: data.name,
        slug,
        description: data.description,
        categoryId: data.categoryId,
        brandId: data.brandId,
        isActive: data.isActive ?? true,
      });

      for (const v of data.variants) {
        const sku = v.sku ?? (await generateSku(data.name, v.size, v.color));
        const barcode = v.barcode ?? (await generateBarcode());

        if (v.sku) {
          const existingSku = await variantRepository.findBySku(v.sku);
          if (existingSku) throw new AppError(`SKU '${v.sku}' already exists`, 409);
        }
        if (v.barcode) {
          const existingBarcode = await variantRepository.findByBarcode(v.barcode);
          if (existingBarcode) throw new AppError(`Barcode '${v.barcode}' already exists`, 409);
        }

        const purchasePrice = v.purchasePrice ?? data.purchasePrice ?? 0;
        const sellingPrice = v.sellingPrice ?? data.sellingPrice ?? 0;
        const mrp = v.mrp ?? data.mrp;
        const gstPercentage = v.gstPercentage ?? data.gstPercentage;

        if (sellingPrice < purchasePrice) {
          throw new AppError(
            `Selling price (₹${sellingPrice}) cannot be less than purchase price (₹${purchasePrice}) for ${sku}`,
            400,
          );
        }
        if (mrp !== undefined && mrp < sellingPrice) {
          throw new AppError(
            `MRP (₹${mrp}) must be greater than or equal to Selling Price (₹${sellingPrice}) for ${sku}`,
            400,
          );
        }

        const variant = await variantRepository.create(
          {
            productId: product.id,
            size: v.size,
            color: v.color,
            fabric: v.fabric,
            rackLocation: v.rackLocation,
            sku,
            barcode,
            purchasePrice,
            sellingPrice,
            gstPercentage,
            stockQuantity: v.initialStock,
            reorderLevel: v.reorderLevel,
          },
          tx,
        );

        if (v.initialStock > 0) {
          await tx.stockMovement.create({
            data: {
              productVariantId: variant.id,
              quantity: v.initialStock,
              type: 'OPENING_STOCK',
              adjustmentReason: 'OPENING_STOCK',
              previousStock: 0,
              newStock: v.initialStock,
              notes: 'Initial stock',
              storeId: storeId || '',
              createdById: userId || '',
            },
          });
        }

        generateBarcodeImage(variant.id, barcode);
      }

      return productRepository.findById(product.id);
    });

    return product;
  },

  async delete(id: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new AppError('Product not found', 404);

    await productRepository.softDelete(id);
  },

  async uploadImage(productId: string, file: Express.Multer.File, isPrimary?: boolean) {
    const product = await productRepository.findById(productId);
    if (!product) throw new AppError('Product not found', 404);

    const imageUrl = `/uploads/${file.filename}`;

    const existingImages = product.images;
    const isFirst = existingImages.length === 0;
    const shouldBePrimary = isPrimary || isFirst;

    const image = await productRepository.addImage({
      productId,
      url: imageUrl,
      isPrimary: shouldBePrimary,
    });

    if (shouldBePrimary && !isFirst) {
      await productRepository.setPrimaryImage(productId, image.id);
    }

    return image;
  },

  async deleteImage(productId: string, imageId: string) {
    const image = await productRepository.findImageById(imageId);
    if (!image || image.productId !== productId) {
      throw new AppError('Image not found', 404);
    }
    await productRepository.deleteImage(imageId);
  },

  async setPrimaryImage(productId: string, imageId: string) {
    const image = await productRepository.findImageById(imageId);
    if (!image || image.productId !== productId) {
      throw new AppError('Image not found', 404);
    }
    return productRepository.setPrimaryImage(productId, imageId);
  },
};
