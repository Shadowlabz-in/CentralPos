import prisma from '../../utils/prisma';

const END_OF_DAY_SUFFIX = 'T23:59:59.999Z';

export const reportService = {
  async sales(params: {
    page: number;
    limit: number;
    fromDate?: string;
    toDate?: string;
    customerId?: string;
    paymentMode?: string;
    createdById?: string;
  }) {
    const where: any = { deletedAt: null };
    if (params.fromDate)
      where.saleDate = { ...(where.saleDate || {}), gte: new Date(params.fromDate) };
    if (params.toDate)
      where.saleDate = {
        ...(where.saleDate || {}),
        lte: new Date(params.toDate + END_OF_DAY_SUFFIX),
      };
    if (params.customerId) where.customerId = params.customerId;
    if (params.createdById) where.createdById = params.createdById;
    if (params.paymentMode) {
      where.payments = { some: { mode: params.paymentMode as any } };
    }

    const [data, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          items: {
            select: {
              quantity: true,
              unitPrice: true,
              totalPrice: true,
              gstAmount: true,
              gstPercentage: true,
              productVariant: {
                select: { sku: true, size: true, color: true, product: { select: { name: true } } },
              },
            },
          },
          payments: { select: { mode: true, amount: true } },
          createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.sale.count({ where }),
    ]);

    return { data, total };
  },

  async purchases(params: {
    page: number;
    limit: number;
    fromDate?: string;
    toDate?: string;
    supplierId?: string;
  }) {
    const where: any = { deletedAt: null };
    if (params.fromDate)
      where.purchaseDate = { ...(where.purchaseDate || {}), gte: new Date(params.fromDate) };
    if (params.toDate)
      where.purchaseDate = {
        ...(where.purchaseDate || {}),
        lte: new Date(params.toDate + END_OF_DAY_SUFFIX),
      };
    if (params.supplierId) where.supplierId = params.supplierId;

    const [data, total] = await Promise.all([
      prisma.purchase.findMany({
        where,
        include: {
          supplier: { select: { id: true, name: true } },
          items: {
            select: {
              quantity: true,
              unitCost: true,
              totalCost: true,
              productVariant: { select: { sku: true, product: { select: { name: true } } } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.purchase.count({ where }),
    ]);

    return { data, total };
  },

  async inventory(params: {
    page: number;
    limit: number;
    categoryId?: string;
    brandId?: string;
    stockStatus?: string;
    search?: string;
  }) {
    const where: any = { deletedAt: null, isActive: true };
    const productWhere: any = {};
    if (params.search) productWhere.name = { contains: params.search, mode: 'insensitive' };
    if (params.categoryId) productWhere.categoryId = params.categoryId;
    if (params.brandId) productWhere.brandId = params.brandId;
    if (Object.keys(productWhere).length > 0) where.product = productWhere;
    if (params.stockStatus === 'low') {
      const lowStockVariants = await prisma.productVariant.findMany({
        where: { deletedAt: null, isActive: true, stockQuantity: { gt: 0 } },
        select: { id: true, stockQuantity: true, reorderLevel: true },
      });
      const filteredIds = lowStockVariants
        .filter((v) => v.stockQuantity <= v.reorderLevel)
        .map((v) => v.id);
      where.id = { in: filteredIds };
    } else if (params.stockStatus === 'out') {
      where.stockQuantity = 0;
    } else if (params.stockStatus === 'in') {
      where.stockQuantity = { gt: 0 };
    }

    const [data, total] = await Promise.all([
      prisma.productVariant.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              category: { select: { name: true } },
              brand: { select: { name: true } },
            },
          },
        },
        orderBy: [{ product: { name: 'asc' } }, { size: 'asc' }],
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.productVariant.count({ where }),
    ]);

    return { data, total };
  },

  async profit(params: {
    fromDate?: string;
    toDate?: string;
    period?: 'daily' | 'weekly' | 'monthly';
  }) {
    const where: any = { deletedAt: null };
    if (params.fromDate)
      where.saleDate = { ...(where.saleDate || {}), gte: new Date(params.fromDate) };
    if (params.toDate)
      where.saleDate = {
        ...(where.saleDate || {}),
        lte: new Date(params.toDate + END_OF_DAY_SUFFIX),
      };

    const sales = await prisma.sale.findMany({
      where,
      select: {
        saleDate: true,
        grandTotal: true,
        items: {
          select: {
            quantity: true,
            unitPrice: true,
            productVariant: { select: { purchasePrice: true } },
          },
        },
      },
      orderBy: { saleDate: 'asc' },
    });

    type PeriodKey = string;
    const grouped: Record<PeriodKey, { revenue: number; cogs: number; count: number }> = {};

    for (const sale of sales) {
      let key: string;
      const d = new Date(sale.saleDate);
      if (params.period === 'daily') key = d.toISOString().slice(0, 10);
      else if (params.period === 'weekly') {
        const startOfWeek = new Date(d);
        startOfWeek.setDate(d.getDate() - d.getDay());
        key = startOfWeek.toISOString().slice(0, 10);
      } else key = d.toISOString().slice(0, 7);

      if (!grouped[key]) grouped[key] = { revenue: 0, cogs: 0, count: 0 };
      grouped[key].revenue += Number(sale.grandTotal);
      grouped[key].count++;
      for (const item of sale.items) {
        grouped[key].cogs += Number(item.productVariant.purchasePrice) * item.quantity;
      }
    }

    return Object.entries(grouped).map(([period, data]) => ({
      period,
      revenue: Math.round(data.revenue * 100) / 100,
      cogs: Math.round(data.cogs * 100) / 100,
      grossProfit: Math.round((data.revenue - data.cogs) * 100) / 100,
      profitMargin:
        data.revenue > 0
          ? Math.round(((data.revenue - data.cogs) / data.revenue) * 10000) / 100
          : 0,
      count: data.count,
    }));
  },

  async gst(params: { fromDate?: string; toDate?: string }) {
    const where: any = { deletedAt: null, isGst: true };
    if (params.fromDate)
      where.saleDate = { ...(where.saleDate || {}), gte: new Date(params.fromDate) };
    if (params.toDate)
      where.saleDate = {
        ...(where.saleDate || {}),
        lte: new Date(params.toDate + END_OF_DAY_SUFFIX),
      };

    const sales = await prisma.sale.findMany({
      where,
      select: {
        subtotal: true,
        taxAmount: true,
        items: { select: { gstPercentage: true, totalPrice: true, gstAmount: true } },
      },
    });

    let totalTaxable = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalGst = 0;
    const byRate: Record<string, { taxable: number; gst: number }> = {
      '0': { taxable: 0, gst: 0 },
      '5': { taxable: 0, gst: 0 },
      '12': { taxable: 0, gst: 0 },
      '18': { taxable: 0, gst: 0 },
      '28': { taxable: 0, gst: 0 },
    };

    for (const sale of sales) {
      totalTaxable += Number(sale.subtotal);
      totalGst += Number(sale.taxAmount);
      for (const item of sale.items) {
        const rate = String(item.gstPercentage);
        if (!byRate[rate]) byRate[rate] = { taxable: 0, gst: 0 };
        byRate[rate].taxable += Number(item.totalPrice);
        byRate[rate].gst += Number(item.gstAmount);
      }
    }

    totalCgst = totalGst / 2;
    totalSgst = totalGst / 2;

    return {
      totalTaxable: Math.round(totalTaxable * 100) / 100,
      cgst: Math.round(totalCgst * 100) / 100,
      sgst: Math.round(totalSgst * 100) / 100,
      totalGst: Math.round(totalGst * 100) / 100,
      byRate: Object.entries(byRate)
        .map(([rate, d]) => ({
          rate: `${rate}%`,
          taxable: Math.round(d.taxable * 100) / 100,
          gst: Math.round(d.gst * 100) / 100,
        }))
        .filter((r) => r.taxable > 0 || r.gst > 0),
    };
  },

  async customers(params: { page: number; limit: number; search?: string }) {
    const where: any = { deletedAt: null };
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { phone: { contains: params.search } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        sales: {
          where: { deletedAt: null },
          select: { grandTotal: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    });

    const total = await prisma.customer.count({ where });

    const data = customers.map((c) => {
      const totalSpend = c.sales.reduce((sum, s) => sum + Number(s.grandTotal), 0);
      const orderCount = c.sales.length;
      const lastPurchase = c.sales[0]?.createdAt || null;
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        gstin: c.gstin,
        totalSpend: Math.round(totalSpend * 100) / 100,
        orderCount,
        averageOrderValue: orderCount > 0 ? Math.round((totalSpend / orderCount) * 100) / 100 : 0,
        lastPurchase,
        createdAt: c.createdAt,
      };
    });

    return { data, total };
  },

  async suppliers(params: { page: number; limit: number; search?: string }) {
    const where: any = { deletedAt: null };
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { phone: { contains: params.search } },
      ];
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      include: {
        purchases: {
          where: { deletedAt: null },
          select: { grandTotal: true, paymentStatus: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    });

    const total = await prisma.supplier.count({ where });

    const data = suppliers.map((s) => {
      const totalPurchaseValue = s.purchases.reduce((sum, p) => sum + Number(p.grandTotal), 0);
      const outstanding = s.purchases
        .filter((p) => p.paymentStatus !== 'PAID')
        .reduce((sum, p) => sum + Number(p.grandTotal), 0);
      return {
        id: s.id,
        name: s.name,
        contactPerson: s.contactPerson,
        phone: s.phone,
        email: s.email,
        gstin: s.gstin,
        purchaseCount: s.purchases.length,
        totalPurchaseValue: Math.round(totalPurchaseValue * 100) / 100,
        outstanding: Math.round(outstanding * 100) / 100,
      };
    });

    return { data, total };
  },

  async exportSales(params: { fromDate?: string; toDate?: string }) {
    const where: any = { deletedAt: null };
    if (params.fromDate)
      where.saleDate = { ...(where.saleDate || {}), gte: new Date(params.fromDate) };
    if (params.toDate)
      where.saleDate = {
        ...(where.saleDate || {}),
        lte: new Date(params.toDate + END_OF_DAY_SUFFIX),
      };

    const sales = await prisma.sale.findMany({
      where,
      include: {
        customer: { select: { name: true } },
        items: {
          select: {
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            gstAmount: true,
            productVariant: { select: { sku: true, product: { select: { name: true } } } },
          },
        },
        payments: { select: { mode: true, amount: true } },
        createdBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sales.flatMap((s) =>
      s.items.map((item) => ({
        'Invoice No': s.invoiceNumber,
        Date: s.saleDate.toISOString().slice(0, 10),
        Customer: s.customer?.name || 'Walk-in',
        Product: item.productVariant.product.name,
        SKU: item.productVariant.sku,
        Qty: item.quantity,
        'Unit Price': Number(item.unitPrice),
        Total: Number(item.totalPrice),
        GST: Number(item.gstAmount),
        'Grand Total': Number(s.grandTotal),
        Payment: s.payments.map((p) => p.mode).join('/'),
        Cashier: `${s.createdBy.firstName} ${s.createdBy.lastName}`,
      })),
    );
  },
};
