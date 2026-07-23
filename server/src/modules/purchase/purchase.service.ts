import prisma from '../../utils/prisma';
import { purchaseRepository, PurchaseFilters } from './purchase.repository';
import { inventoryRepository } from '../inventory/inventory.repository';
import { variantRepository } from '../variant/variant.repository';
import { AppError } from '../../middleware/errorHandler';

export const purchaseService = {
  async list(filters: PurchaseFilters & { page: number; limit: number }) {
    const { page, limit, ...restFilters } = filters;
    const skip = (page - 1) * limit;

    const [purchases, total] = await Promise.all([
      purchaseRepository.findAll(skip, limit, restFilters),
      purchaseRepository.countAll(restFilters),
    ]);

    return {
      data: purchases.map((p) => ({
        id: p.id,
        invoiceNumber: p.invoiceNumber,
        supplier: p.supplier,
        purchaseDate: p.purchaseDate,
        subtotal: p.subtotal,
        discountAmount: p.discountAmount,
        taxAmount: p.taxAmount,
        grandTotal: p.grandTotal,
        status: p.status,
        paymentStatus: p.paymentStatus,
        paymentMode: p.paymentMode,
        notes: p.notes,
        createdBy: p.createdBy,
        itemCount: p.items.length,
        items: p.items,
        createdAt: p.createdAt,
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
    const purchase = await purchaseRepository.findById(id);
    if (!purchase) throw new AppError('Purchase not found', 404);
    return purchase;
  },

  async create(data: {
    supplierId: string;
    invoiceNumber: string;
    purchaseDate: string;
    paymentStatus?: string;
    paymentMode?: string;
    notes?: string;
    items: Array<{
      productVariantId: string;
      quantity: number;
      unitCost: number;
      gstPercentage?: number;
      discount?: number;
    }>;
    createdById: string;
    storeId: string;
  }) {
    const existingInvoice = await purchaseRepository.findByInvoice(data.invoiceNumber);
    if (existingInvoice) {
      throw new AppError('Purchase with this invoice number already exists', 409);
    }

    const supplier = await prisma.supplier.findFirst({
      where: { id: data.supplierId, deletedAt: null },
    });
    if (!supplier) throw new AppError('Supplier not found', 404);

    for (const item of data.items) {
      const variant = await variantRepository.findById(item.productVariantId);
      if (!variant) {
        throw new AppError(`Variant with ID ${item.productVariantId} not found`, 404);
      }
    }

    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    for (const item of data.items) {
      const lineTotal = item.unitCost * item.quantity;
      const gstAmount = (lineTotal * (item.gstPercentage || 0)) / 100;
      const discountAmount = item.discount || 0;

      subtotal += lineTotal;
      totalTax += gstAmount;
      totalDiscount += discountAmount;
    }

    const grandTotal = subtotal + totalTax - totalDiscount;

    const result = await prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.create({
        data: {
          invoiceNumber: data.invoiceNumber,
          supplierId: data.supplierId,
          purchaseDate: new Date(data.purchaseDate),
          subtotal,
          discountAmount: totalDiscount,
          taxAmount: totalTax,
          grandTotal,
          status: 'RECEIVED',
          paymentStatus: (data.paymentStatus as any) || 'PENDING',
          paymentMode: (data.paymentMode as any) || undefined,
          notes: data.notes,
          storeId: data.storeId,
          createdById: data.createdById,
          items: {
            create: data.items.map((item) => ({
              productVariantId: item.productVariantId,
              quantity: item.quantity,
              unitCost: item.unitCost,
              totalCost: item.unitCost * item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      for (const item of purchase.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.productVariantId },
        });
        if (!variant) continue;

        const previousStock = variant.stockQuantity;
        const newStock = previousStock + item.quantity;

        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: { stockQuantity: newStock },
        });

        await tx.stockMovement.create({
          data: {
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            type: 'PURCHASE',
            previousStock,
            newStock,
            purchaseItemId: item.id,
            notes: `Purchase: ${data.invoiceNumber}`,
            storeId: data.storeId,
            createdById: data.createdById,
          },
        });
      }

      return purchase;
    });

    return result;
  },

  async update(
    id: string,
    data: {
      invoiceNumber?: string;
      paymentStatus?: string;
      paymentMode?: string;
      notes?: string;
    },
  ) {
    const purchase = await purchaseRepository.findById(id);
    if (!purchase) throw new AppError('Purchase not found', 404);

    if (data.invoiceNumber && data.invoiceNumber !== purchase.invoiceNumber) {
      const existingInvoice = await purchaseRepository.findByInvoice(data.invoiceNumber);
      if (existingInvoice) throw new AppError('Invoice number already exists', 409);
    }

    return purchaseRepository.update(id, data as any);
  },
};
