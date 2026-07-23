import prisma from '../../utils/prisma';
import { saleRepository } from './sale.repository';
import { AppError } from '../../middleware/errorHandler';

function generateInvoiceNumber(): string {
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `POS-${dateStr}-${rand}`;
}

function gstRateToNumber(rate: string): number {
  const map: Record<string, number> = { GST_0: 0, GST_5: 5, GST_12: 12, GST_18: 18, GST_28: 28 };
  return map[rate] ?? 0;
}

export const saleService = {
  async lookupVariant(variantId: string) {
    return prisma.productVariant.findFirst({
      where: { id: variantId, deletedAt: null, isActive: true },
      include: { product: { select: { id: true, name: true, slug: true } } },
    });
  },

  async checkout(
    userId: string,
    storeId: string,
    data: {
      customerId?: string | null;
      isGst: boolean;
      discountAmount: number;
      notes?: string | null;
      payments: {
        mode: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER';
        amount: number;
        reference?: string | null;
      }[];
      cartItems: { productVariantId: string; quantity: number; unitPrice: number }[];
    },
  ) {
    if (!data.cartItems.length) {
      throw new AppError('Cart is empty', 400);
    }

    const totalPayments = data.payments.reduce((sum, p) => sum + p.amount, 0);

    const variantIds = data.cartItems.map((i) => i.productVariantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds }, deletedAt: null, isActive: true },
      include: { product: { select: { id: true, name: true } } },
    });

    if (variants.length !== data.cartItems.length) {
      throw new AppError('One or more products are inactive or not found', 400);
    }

    const variantMap = new Map(variants.map((v) => [v.id, v]));

    let subtotal = 0;
    let totalTax = 0;

    for (const item of data.cartItems) {
      const variant = variantMap.get(item.productVariantId)!;
      if (variant.stockQuantity < item.quantity) {
        throw new AppError(
          `Insufficient stock for ${variant.product.name} (${variant.size}/${variant.color}). Available: ${variant.stockQuantity}`,
          400,
        );
      }
      const gstPct = gstRateToNumber(variant.gstPercentage);
      const lineTotal = item.unitPrice * item.quantity;
      const gstAmount = data.isGst ? (lineTotal * gstPct) / 100 : 0;
      subtotal += lineTotal;
      totalTax += gstAmount;
    }

    const grandTotal = subtotal + totalTax - data.discountAmount;

    if (Math.abs(totalPayments - grandTotal) > 0.01) {
      throw new AppError(
        `Payment total (${totalPayments.toFixed(2)}) does not match grand total (${grandTotal.toFixed(2)})`,
        400,
      );
    }

    const invoiceNumber = generateInvoiceNumber();

    const result = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          invoiceNumber,
          customerId: data.customerId || null,
          saleDate: new Date(),
          subtotal,
          discountAmount: data.discountAmount,
          taxAmount: totalTax,
          grandTotal,
          isGst: data.isGst,
          notes: data.notes || null,
          storeId,
          createdById: userId,
          items: {
            create: data.cartItems.map((item) => {
              const variant = variantMap.get(item.productVariantId)!;
              const gstPct = gstRateToNumber(variant.gstPercentage);
              const lineTotal = item.unitPrice * item.quantity;
              const gstAmount = data.isGst ? (lineTotal * gstPct) / 100 : 0;
              return {
                productVariantId: item.productVariantId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                gstPercentage: gstPct,
                gstAmount,
                totalPrice: lineTotal,
              };
            }),
          },
          payments: {
            create: data.payments.map((p) => ({
              mode: p.mode,
              amount: p.amount,
              reference: p.reference || null,
            })),
          },
        },
        include: {
          items: {
            include: { productVariant: { include: { product: { select: { name: true } } } } },
          },
          payments: true,
          customer: true,
        },
      });

      for (const item of data.cartItems) {
        const variant = variantMap.get(item.productVariantId)!;
        const newStock = variant.stockQuantity - item.quantity;
        const saleItem = sale.items.find((si) => si.productVariantId === item.productVariantId)!;

        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: { stockQuantity: newStock },
        });

        await tx.stockMovement.create({
          data: {
            productVariantId: item.productVariantId,
            quantity: -item.quantity,
            type: 'SALE',
            previousStock: variant.stockQuantity,
            newStock,
            saleItemId: saleItem.id,
            notes: `Sale ${invoiceNumber}`,
            storeId,
            createdById: userId,
          },
        });

        const availableItems = await tx.inventoryItem.findMany({
          where: { variantId: item.productVariantId, status: 'AVAILABLE' },
          orderBy: { createdAt: 'asc' },
          take: item.quantity,
        });

        if (availableItems.length > 0) {
          const itemIds = availableItems.map((inv) => inv.id);
          await tx.inventoryItem.updateMany({
            where: { id: { in: itemIds } },
            data: { status: 'SOLD', saleId: sale.id, saleItemId: saleItem.id, soldAt: new Date() },
          });
        }
      }

      return sale;
    });

    return result;
  },

  async list(params: {
    page: number;
    limit: number;
    fromDate?: string;
    toDate?: string;
    customerId?: string;
  }) {
    return saleRepository.findAll(params);
  },

  async getById(id: string) {
    const sale = await saleRepository.findById(id);
    if (!sale) throw new AppError('Sale not found', 404);
    return sale;
  },

  async cancel(id: string, userId: string) {
    const sale = await saleRepository.findById(id);
    if (!sale) throw new AppError('Sale not found', 404);
    if (sale.deletedAt) throw new AppError('Sale is already cancelled', 400);

    await prisma.$transaction(async (tx) => {
      await tx.sale.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      for (const item of sale.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.productVariantId },
        });
        if (!variant) continue;

        const newStock = variant.stockQuantity + item.quantity;

        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: { stockQuantity: newStock },
        });

        await tx.stockMovement.create({
          data: {
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            type: 'RETURN',
            previousStock: variant.stockQuantity,
            newStock,
            notes: `Cancelled sale ${sale.invoiceNumber}`,
            storeId: sale.storeId,
            createdById: userId,
          },
        });

        await tx.inventoryItem.updateMany({
          where: { saleItemId: item.id, status: 'SOLD' },
          data: { status: 'AVAILABLE', soldAt: null, saleId: null, saleItemId: null },
        });
      }
    });
  },
};
