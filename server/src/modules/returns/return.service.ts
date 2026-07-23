import prisma from '../../utils/prisma';
import { AppError } from '../../middleware/errorHandler';

function generateReturnNumber(): string {
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RTR-${dateStr}-${rand}`;
}

function generateCreditNoteNumber(): string {
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CN-${dateStr}-${rand}`;
}

export const returnService = {
  async createReturn(
    userId: string,
    storeId: string,
    data: {
      saleId: string;
      returnDate?: string;
      reason?: string;
      items: {
        saleItemId: string;
        productVariantId: string;
        quantity: number;
        unitPrice?: number;
        reason?: string;
        condition: 'RESELLABLE' | 'DAMAGED' | 'DEFECTIVE';
        isResellable?: boolean;
      }[];
      refundMethod?: string;
      refundAmount?: number;
    },
  ) {
    const sale = await prisma.sale.findFirst({
      where: { id: data.saleId, deletedAt: null },
      include: {
        items: { include: { productVariant: true } },
      },
    });
    if (!sale) throw new AppError('Sale not found', 404);

    let totalRefund = 0;

    for (const item of data.items) {
      const saleItem = sale.items.find(
        (si) => si.id === item.saleItemId && si.productVariantId === item.productVariantId,
      );
      if (!saleItem) throw new AppError(`Sale item ${item.saleItemId} not found in this sale`, 400);

      const alreadyReturned = await prisma.salesReturnItem.aggregate({
        where: { saleItemId: item.saleItemId, salesReturn: { deletedAt: null } },
        _sum: { quantity: true },
      });
      const returnedQty = alreadyReturned._sum.quantity || 0;
      const availableToReturn = saleItem.quantity - returnedQty;
      if (item.quantity > availableToReturn) {
        throw new AppError(
          `Cannot return ${item.quantity} of item. Only ${availableToReturn} available to return (sold: ${saleItem.quantity}, already returned: ${returnedQty})`,
          400,
        );
      }

      const unitPrice = item.unitPrice || Number(saleItem.unitPrice);
      totalRefund += unitPrice * item.quantity;
    }

    const returnNumber = generateReturnNumber();

    const result = await prisma.$transaction(async (tx) => {
      const salesReturn = await tx.salesReturn.create({
        data: {
          returnNumber,
          saleId: data.saleId,
          returnDate: data.returnDate ? new Date(data.returnDate) : new Date(),
          totalAmount: totalRefund,
          reason: data.reason || null,
          refundMethod: (data.refundMethod as any) || null,
          refundAmount: data.refundAmount || null,
          refundDate: data.refundMethod ? new Date() : null,
          refundProcessedById: data.refundMethod ? userId : null,
          storeId,
          createdById: userId,
          items: {
            create: data.items.map((item) => {
              const saleItem = sale.items.find((si) => si.id === item.saleItemId)!;
              const unitPrice = item.unitPrice || Number(saleItem.unitPrice);
              return {
                saleItemId: item.saleItemId,
                productVariantId: item.productVariantId,
                quantity: item.quantity,
                unitPrice,
                totalAmount: unitPrice * item.quantity,
                reason: item.reason || null,
                condition: item.condition as any,
              };
            }),
          },
        },
        include: { items: { include: { productVariant: true } } },
      });

      // Update stock and create movements
      for (const item of data.items) {
        const saleItem = sale.items.find((si) => si.id === item.saleItemId)!;
        const variant = saleItem.productVariant;
        const isResellable = item.condition === 'RESELLABLE';

        if (isResellable) {
          await tx.productVariant.update({
            where: { id: item.productVariantId },
            data: { stockQuantity: variant.stockQuantity + item.quantity },
          });
        }

        if (isResellable) {
          await tx.stockMovement.create({
            data: {
              productVariantId: item.productVariantId,
              quantity: item.quantity,
              type: 'RETURN',
              previousStock: variant.stockQuantity,
              newStock: variant.stockQuantity + item.quantity,
              salesReturnItemId: salesReturn.items.find(
                (ri) => ri.productVariantId === item.productVariantId,
              )?.id,
              notes: `Return ${returnNumber} - ${item.condition}${item.reason ? ` (${item.reason})` : ''}`,
              storeId,
              createdById: userId,
            },
          });
        } else {
          await tx.stockMovement.create({
            data: {
              productVariantId: item.productVariantId,
              quantity: 0,
              type: 'DAMAGE',
              previousStock: variant.stockQuantity,
              newStock: variant.stockQuantity,
              salesReturnItemId: salesReturn.items.find(
                (ri) => ri.productVariantId === item.productVariantId,
              )?.id,
              notes: `Damaged return ${returnNumber}${item.reason ? ` (${item.reason})` : ''}`,
              storeId,
              createdById: userId,
            },
          });
        }

        const soldItems = await tx.inventoryItem.findMany({
          where: { variantId: item.productVariantId, saleItemId: item.saleItemId, status: 'SOLD' },
          orderBy: { soldAt: 'asc' },
          take: item.quantity,
        });

        if (soldItems.length > 0) {
          const ids = soldItems.map((inv) => inv.id);
          const newStatus = isResellable ? 'AVAILABLE' : 'RETURNED';
          await tx.inventoryItem.updateMany({
            where: { id: { in: ids } },
            data: {
              status: newStatus,
              returnedAt: new Date(),
              returnReason: item.reason || data.reason || null,
              saleId: null,
              saleItemId: null,
              soldAt: null,
            },
          });
        }
      }

      // Create credit note if refund method is STORE_CREDIT
      if (data.refundMethod === 'STORE_CREDIT' && data.refundAmount && data.refundAmount > 0) {
        await tx.creditNote.create({
          data: {
            creditNoteNumber: generateCreditNoteNumber(),
            customerId: sale.customerId,
            salesReturnId: salesReturn.id,
            originalSaleId: data.saleId,
            amount: data.refundAmount,
            availableAmount: data.refundAmount,
            storeId,
            createdById: userId,
          },
        });
      }

      return salesReturn;
    });

    return result;
  },

  async listReturns(params: { page: number; limit: number; saleId?: string }) {
    const where: any = { deletedAt: null };
    if (params.saleId) where.saleId = params.saleId;

    const [data, total] = await Promise.all([
      prisma.salesReturn.findMany({
        where,
        include: {
          sale: { select: { invoiceNumber: true } },
          items: {
            include: {
              productVariant: {
                select: { sku: true, size: true, color: true, product: { select: { name: true } } },
              },
            },
          },
          createdBy: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.salesReturn.count({ where }),
    ]);

    return { data, total };
  },

  async getReturn(id: string) {
    const salesReturn = await prisma.salesReturn.findFirst({
      where: { id, deletedAt: null },
      include: {
        sale: { select: { id: true, invoiceNumber: true, grandTotal: true } },
        items: {
          include: {
            productVariant: {
              select: {
                id: true,
                sku: true,
                size: true,
                color: true,
                purchasePrice: true,
                product: { select: { name: true } },
              },
            },
            saleItem: { select: { id: true, quantity: true, unitPrice: true } },
          },
        },
        createdBy: { select: { firstName: true, lastName: true } },
        refundProcessedBy: { select: { firstName: true, lastName: true } },
        creditNotes: true,
      },
    });
    if (!salesReturn) throw new AppError('Return not found', 404);
    return salesReturn;
  },

  async processExchange(
    userId: string,
    storeId: string,
    data: {
      saleId: string;
      returnItems: {
        saleItemId: string;
        productVariantId: string;
        quantity: number;
        condition: 'RESELLABLE' | 'DAMAGED' | 'DEFECTIVE';
      }[];
      exchangeItems: {
        productVariantId: string;
        quantity: number;
        unitPrice: number;
      }[];
      additionalPayments: { mode: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER'; amount: number }[];
      customerId?: string | null;
    },
  ) {
    const sale = await prisma.sale.findFirst({
      where: { id: data.saleId, deletedAt: null },
      include: {
        items: {
          include: { productVariant: true },
        },
      },
    });
    if (!sale) throw new AppError('Original sale not found', 404);

    // Validate return items
    for (const item of data.returnItems) {
      const saleItem = sale.items.find((si) => si.id === item.saleItemId);
      if (!saleItem) throw new AppError(`Sale item ${item.saleItemId} not found`, 400);
      const alreadyReturned = await prisma.salesReturnItem.aggregate({
        where: { saleItemId: item.saleItemId, salesReturn: { deletedAt: null } },
        _sum: { quantity: true },
      });
      const available = saleItem.quantity - (alreadyReturned._sum.quantity || 0);
      if (item.quantity > available) {
        throw new AppError(`Only ${available} available to return for item`, 400);
      }
    }

    // Validate exchange items exist and have stock
    const exchangeVariantIds = data.exchangeItems.map((i) => i.productVariantId);
    const exchangeVariants = await prisma.productVariant.findMany({
      where: { id: { in: exchangeVariantIds }, deletedAt: null, isActive: true },
    });
    if (exchangeVariants.length !== data.exchangeItems.length) {
      throw new AppError('One or more exchange products not found or inactive', 400);
    }
    const exchangeVariantMap = new Map(exchangeVariants.map((v) => [v.id, v]));

    for (const item of data.exchangeItems) {
      const variant = exchangeVariantMap.get(item.productVariantId)!;
      if (variant.stockQuantity < item.quantity) {
        throw new AppError(
          `Insufficient stock for exchange item. Available: ${variant.stockQuantity}`,
          400,
        );
      }
    }

    // Calculate totals
    let returnTotal = 0;
    for (const item of data.returnItems) {
      const saleItem = sale.items.find((si) => si.id === item.saleItemId)!;
      returnTotal += Number(saleItem.unitPrice) * item.quantity;
    }

    let exchangeTotal = 0;
    let exchangeTax = 0;
    for (const item of data.exchangeItems) {
      const variant = exchangeVariantMap.get(item.productVariantId)!;
      const lineTotal = item.unitPrice * item.quantity;
      exchangeTotal += lineTotal;
    }

    const priceDiff = exchangeTotal - returnTotal;
    const additionalPaymentTotal = data.additionalPayments.reduce((s, p) => s + p.amount, 0);

    if (priceDiff > 0 && additionalPaymentTotal < priceDiff) {
      throw new AppError(`Exchange requires additional payment of ₹${priceDiff.toFixed(2)}`, 400);
    }

    const returnNumber = generateReturnNumber();
    const exchangeInvoiceNumber = `EXC-${Date.now().toString(36).toUpperCase()}`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create return record
      const salesReturn = await tx.salesReturn.create({
        data: {
          returnNumber,
          saleId: data.saleId,
          returnDate: new Date(),
          totalAmount: returnTotal,
          reason: 'Exchange',
          storeId,
          createdById: userId,
          items: {
            create: data.returnItems.map((item) => {
              const saleItem = sale.items.find((si) => si.id === item.saleItemId)!;
              return {
                saleItemId: item.saleItemId,
                productVariantId: item.productVariantId,
                quantity: item.quantity,
                unitPrice: Number(saleItem.unitPrice),
                totalAmount: Number(saleItem.unitPrice) * item.quantity,
                condition: item.condition as any,
              };
            }),
          },
        },
      });

      // 2. Update stock for returned items
      for (const item of data.returnItems) {
        const saleItem = sale.items.find((si) => si.id === item.saleItemId)!;
        const variant = saleItem.productVariant;
        const isResellable = item.condition === 'RESELLABLE';

        if (isResellable) {
          await tx.productVariant.update({
            where: { id: item.productVariantId },
            data: { stockQuantity: variant.stockQuantity + item.quantity },
          });
          await tx.stockMovement.create({
            data: {
              productVariantId: item.productVariantId,
              quantity: item.quantity,
              type: 'RETURN',
              previousStock: variant.stockQuantity,
              newStock: variant.stockQuantity + item.quantity,
              notes: `Exchange return ${returnNumber}`,
              storeId,
              createdById: userId,
            },
          });
        } else {
          await tx.stockMovement.create({
            data: {
              productVariantId: item.productVariantId,
              quantity: 0,
              type: 'DAMAGE',
              previousStock: variant.stockQuantity,
              newStock: variant.stockQuantity,
              notes: `Exchange damaged return ${returnNumber}`,
              storeId,
              createdById: userId,
            },
          });
        }
      }

      // 3. Create exchange sale
      const exchangeSale = await tx.sale.create({
        data: {
          invoiceNumber: exchangeInvoiceNumber,
          customerId: data.customerId || sale.customerId,
          saleDate: new Date(),
          subtotal: exchangeTotal,
          discountAmount: priceDiff < 0 ? Math.abs(priceDiff) : 0,
          taxAmount: exchangeTax,
          grandTotal: exchangeTotal,
          isGst: sale.isGst,
          notes: `Exchange from ${sale.invoiceNumber}`,
          storeId,
          createdById: userId,
          items: {
            create: data.exchangeItems.map((item) => ({
              productVariantId: item.productVariantId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              gstPercentage: 0,
              gstAmount: 0,
              totalPrice: item.unitPrice * item.quantity,
            })),
          },
          payments: {
            create:
              data.additionalPayments.length > 0
                ? data.additionalPayments.map((p) => ({ mode: p.mode, amount: p.amount }))
                : [{ mode: 'CASH' as const, amount: 0 }],
          },
        },
        include: { items: true },
      });

      // 4. Update stock for exchange items
      for (const item of data.exchangeItems) {
        const variant = exchangeVariantMap.get(item.productVariantId)!;
        const newStock = variant.stockQuantity - item.quantity;
        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: { stockQuantity: newStock },
        });
        const saleItem = exchangeSale.items.find(
          (si) => si.productVariantId === item.productVariantId,
        )!;
        await tx.stockMovement.create({
          data: {
            productVariantId: item.productVariantId,
            quantity: -item.quantity,
            type: 'SALE',
            previousStock: variant.stockQuantity,
            newStock,
            saleItemId: saleItem?.id,
            notes: `Exchange sale ${exchangeInvoiceNumber}`,
            storeId,
            createdById: userId,
          },
        });
      }

      // 5. Credit note if exchange is cheaper
      if (priceDiff < 0) {
        const creditAmount = Math.abs(priceDiff);
        await tx.creditNote.create({
          data: {
            creditNoteNumber: generateCreditNoteNumber(),
            customerId: data.customerId || sale.customerId,
            salesReturnId: salesReturn.id,
            originalSaleId: data.saleId,
            amount: creditAmount,
            availableAmount: creditAmount,
            notes: `Price difference refund for exchange from ${sale.invoiceNumber}`,
            storeId,
            createdById: userId,
          },
        });
      }

      return { salesReturn, exchangeSale };
    });

    return result;
  },

  async processRefund(
    userId: string,
    data: { salesReturnId: string; refundMethod: string; refundAmount: number },
  ) {
    const salesReturn = await prisma.salesReturn.findFirst({
      where: { id: data.salesReturnId, deletedAt: null },
    });
    if (!salesReturn) throw new AppError('Sales return not found', 404);
    if (salesReturn.refundAmount && Number(salesReturn.refundAmount) > 0) {
      throw new AppError('Refund already processed for this return', 400);
    }

    return prisma.salesReturn.update({
      where: { id: data.salesReturnId },
      data: {
        refundMethod: data.refundMethod as any,
        refundAmount: data.refundAmount,
        refundDate: new Date(),
        refundProcessedById: userId,
      },
    });
  },

  async createCreditNote(
    userId: string,
    storeId: string,
    data: {
      customerId?: string | null;
      salesReturnId?: string | null;
      originalSaleId?: string | null;
      amount: number;
      expiryDate?: string | null;
      notes?: string;
    },
  ) {
    return prisma.creditNote.create({
      data: {
        creditNoteNumber: generateCreditNoteNumber(),
        customerId: data.customerId || null,
        salesReturnId: data.salesReturnId || null,
        originalSaleId: data.originalSaleId || null,
        amount: data.amount,
        availableAmount: data.amount,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        notes: data.notes || null,
        storeId,
        createdById: userId,
      },
    });
  },

  async listCreditNotes(params: {
    page: number;
    limit: number;
    customerId?: string;
    status?: string;
  }) {
    const where: any = { deletedAt: null };
    if (params.customerId) where.customerId = params.customerId;
    if (params.status) where.status = params.status;

    const [data, total] = await Promise.all([
      prisma.creditNote.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true } },
          salesReturn: { select: { returnNumber: true } },
          redemptions: { select: { amount: true, sale: { select: { invoiceNumber: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.creditNote.count({ where }),
    ]);

    return { data, total };
  },

  async redeemCreditNote(
    userId: string,
    data: { creditNoteId: string; saleId: string; amount: number },
  ) {
    const creditNote = await prisma.creditNote.findFirst({
      where: { id: data.creditNoteId, deletedAt: null, status: 'ACTIVE' },
    });
    if (!creditNote) throw new AppError('Credit note not found or not active', 404);
    if (Number(creditNote.availableAmount) < data.amount) {
      throw new AppError(
        `Insufficient credit. Available: ₹${Number(creditNote.availableAmount).toFixed(2)}`,
        400,
      );
    }

    if (creditNote.expiryDate && creditNote.expiryDate < new Date()) {
      await prisma.creditNote.update({
        where: { id: data.creditNoteId },
        data: { status: 'EXPIRED' },
      });
      throw new AppError('Credit note has expired', 400);
    }

    const sale = await prisma.sale.findFirst({ where: { id: data.saleId, deletedAt: null } });
    if (!sale) throw new AppError('Sale not found', 404);

    return prisma.$transaction(async (tx) => {
      const newAvailable = Number(creditNote.availableAmount) - data.amount;
      const newStatus = newAvailable <= 0 ? ('REDEEMED' as const) : ('ACTIVE' as const);

      await tx.creditNote.update({
        where: { id: data.creditNoteId },
        data: {
          availableAmount: newAvailable,
          status: newStatus,
          redeemedAt: newStatus === 'REDEEMED' ? new Date() : undefined,
        },
      });

      await tx.creditNoteRedemption.create({
        data: {
          creditNoteId: data.creditNoteId,
          saleId: data.saleId,
          amount: data.amount,
        },
      });

      await tx.salePayment.create({
        data: {
          saleId: data.saleId,
          mode: 'STORE_CREDIT',
          amount: data.amount,
          reference: creditNote.creditNoteNumber,
        },
      });

      return {
        creditNoteNumber: creditNote.creditNoteNumber,
        redeemedAmount: data.amount,
        remainingBalance: newAvailable,
      };
    });
  },
};
