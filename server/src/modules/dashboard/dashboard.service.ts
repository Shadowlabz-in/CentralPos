import prisma from '../../utils/prisma';

const END_OF_DAY_SUFFIX = 'T23:59:59.999Z';

function dateRange(daysAgo: number): { gte: Date; lte: Date } {
  const start = new Date();
  start.setDate(start.getDate() - daysAgo);
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { gte: start, lte: end };
}

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { gte: start, lte: end };
}

function monthRange() {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { gte: start, lte: end };
}

function yearRange() {
  const start = new Date();
  start.setMonth(0, 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { gte: start, lte: end };
}

async function saleAggregation(where: any) {
  const result = await prisma.sale.aggregate({
    where: { ...where, deletedAt: null },
    _sum: { subtotal: true, discountAmount: true, taxAmount: true, grandTotal: true },
    _count: { id: true },
  });
  return {
    billCount: result._count.id,
    grossSales: Number(result._sum.subtotal || 0),
    netSales: Number(result._sum.grandTotal || 0),
    discounts: Number(result._sum.discountAmount || 0),
    gstCollected: Number(result._sum.taxAmount || 0),
  };
}

export const dashboardService = {
  async overview() {
    const today = await saleAggregation({ saleDate: todayRange() });
    const yesterdayStart = new Date();
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date();
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
    yesterdayEnd.setHours(23, 59, 59, 999);
    const yesterday = await saleAggregation({
      saleDate: { gte: yesterdayStart, lte: yesterdayEnd },
    });
    const week = await saleAggregation({ saleDate: dateRange(6) });
    const month = await saleAggregation({ saleDate: monthRange() });
    const year = await saleAggregation({ saleDate: yearRange() });

    return { today, yesterday, week, month, year };
  },

  async profit(params: {
    fromDate?: string;
    toDate?: string;
    categoryId?: string;
    brandId?: string;
  }) {
    const where: any = { deletedAt: null };
    if (params.fromDate) {
      where.saleDate = { ...(where.saleDate || {}), gte: new Date(params.fromDate) };
    }
    if (params.toDate) {
      where.saleDate = {
        ...(where.saleDate || {}),
        lte: new Date(params.toDate + END_OF_DAY_SUFFIX),
      };
    }

    const sales = await prisma.sale.findMany({
      where,
      select: {
        grandTotal: true,
        items: {
          select: {
            quantity: true,
            unitPrice: true,
            productVariant: {
              select: {
                purchasePrice: true,
                product: { select: { categoryId: true, brandId: true } },
              },
            },
          },
        },
      },
    });

    let totalRevenue = 0;
    let totalCogs = 0;

    for (const sale of sales) {
      totalRevenue += Number(sale.grandTotal);
      for (const item of sale.items) {
        if (params.categoryId && item.productVariant.product.categoryId !== params.categoryId)
          continue;
        if (params.brandId && item.productVariant.product.brandId !== params.brandId) continue;
        totalCogs += Number(item.productVariant.purchasePrice) * item.quantity;
      }
    }

    const grossProfit = totalRevenue - totalCogs;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalCogs,
      grossProfit,
      profitMargin: Math.round(profitMargin * 100) / 100,
    };
  },

  async inventory() {
    const variants = await prisma.productVariant.findMany({
      where: { deletedAt: null, isActive: true },
      select: { stockQuantity: true, purchasePrice: true, reorderLevel: true },
    });

    let totalValue = 0;
    let lowStock = 0;
    let outOfStock = 0;

    for (const v of variants) {
      totalValue += Number(v.purchasePrice) * v.stockQuantity;
      if (v.stockQuantity <= v.reorderLevel) lowStock++;
      if (v.stockQuantity <= 0) outOfStock++;
    }

    const totalProducts = await prisma.product.count({ where: { deletedAt: null } });
    const totalVariants = variants.length;

    return { totalValue, totalProducts, totalVariants, lowStock, outOfStock };
  },

  async purchases() {
    const month = monthRange();
    const totalAgg = await prisma.purchase.aggregate({
      where: { deletedAt: null },
      _sum: { grandTotal: true },
      _count: { id: true },
    });
    const monthAgg = await prisma.purchase.aggregate({
      where: { deletedAt: null, purchaseDate: month },
      _sum: { grandTotal: true },
      _count: { id: true },
    });
    const pendingPayments = await prisma.purchase.count({
      where: { deletedAt: null, paymentStatus: { in: ['PENDING', 'PARTIAL'] } },
    });
    const supplierCount = await prisma.supplier.count({
      where: { deletedAt: null, isActive: true },
    });

    return {
      totalPurchases: totalAgg._count.id,
      totalValue: Number(totalAgg._sum.grandTotal || 0),
      monthlyPurchases: monthAgg._count.id,
      monthlyValue: Number(monthAgg._sum.grandTotal || 0),
      pendingPayments,
      supplierCount,
    };
  },

  async customers() {
    const total = await prisma.customer.count({ where: { deletedAt: null } });
    const month = monthRange();
    const newCustomers = await prisma.customer.count({
      where: { deletedAt: null, createdAt: month },
    });

    const topCustomers = await prisma.sale.groupBy({
      by: ['customerId'],
      where: { deletedAt: null, customerId: { not: null } },
      _sum: { grandTotal: true },
      _count: { id: true },
      orderBy: { _sum: { grandTotal: 'desc' } },
      take: 5,
    });

    const customerIds = topCustomers.map((c) => c.customerId).filter(Boolean) as string[];
    const customers = customerIds.length
      ? await prisma.customer.findMany({
          where: { id: { in: customerIds }, deletedAt: null },
          select: { id: true, name: true },
        })
      : [];

    const top = topCustomers.map((c) => {
      const cust = customers.find((cx) => cx.id === c.customerId);
      return {
        name: cust?.name || 'Unknown',
        totalSpent: Number(c._sum.grandTotal || 0),
        orderCount: c._count.id,
      };
    });

    const returning = total - newCustomers;

    return {
      totalCustomers: total,
      newCustomers,
      returningCustomers: returning,
      topCustomers: top,
    };
  },

  async salesChart(params: { period: 'daily' | 'monthly'; fromDate?: string; toDate?: string }) {
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
      select: { saleDate: true, grandTotal: true, subtotal: true },
      orderBy: { saleDate: 'asc' },
    });

    const grouped: Record<string, { sales: number; revenue: number; count: number }> = {};

    for (const s of sales) {
      let key: string;
      if (params.period === 'daily') {
        key = s.saleDate.toISOString().slice(0, 10);
      } else {
        key = s.saleDate.toISOString().slice(0, 7);
      }
      if (!grouped[key]) grouped[key] = { sales: 0, revenue: 0, count: 0 };
      grouped[key].sales += Number(s.subtotal);
      grouped[key].revenue += Number(s.grandTotal);
      grouped[key].count++;
    }

    return Object.entries(grouped).map(([date, data]) => ({ date, ...data }));
  },

  async salesByCategory(params: { fromDate?: string; toDate?: string }) {
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
        items: {
          select: {
            totalPrice: true,
            productVariant: {
              select: { product: { select: { category: { select: { name: true } } } } },
            },
          },
        },
      },
    });

    const categories: Record<string, number> = {};
    for (const sale of sales) {
      for (const item of sale.items) {
        const name = item.productVariant.product.category?.name || 'Uncategorized';
        categories[name] = (categories[name] || 0) + Number(item.totalPrice);
      }
    }

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  },

  async salesByBrand(params: { fromDate?: string; toDate?: string }) {
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
        items: {
          select: {
            totalPrice: true,
            productVariant: {
              select: { product: { select: { brand: { select: { name: true } } } } },
            },
          },
        },
      },
    });

    const brands: Record<string, number> = {};
    for (const sale of sales) {
      for (const item of sale.items) {
        const name = item.productVariant.product.brand?.name || 'Unbranded';
        brands[name] = (brands[name] || 0) + Number(item.totalPrice);
      }
    }

    return Object.entries(brands).map(([name, value]) => ({ name, value }));
  },

  async topProducts(params: { fromDate?: string; toDate?: string; limit?: number }) {
    const where: any = { deletedAt: null };
    if (params.fromDate)
      where.saleDate = { ...(where.saleDate || {}), gte: new Date(params.fromDate) };
    if (params.toDate)
      where.saleDate = {
        ...(where.saleDate || {}),
        lte: new Date(params.toDate + END_OF_DAY_SUFFIX),
      };

    const items = await prisma.saleItem.findMany({
      where: { sale: where },
      select: {
        quantity: true,
        totalPrice: true,
        productVariant: {
          select: {
            sku: true,
            size: true,
            color: true,
            product: { select: { name: true } },
          },
        },
      },
    });

    const products: Record<
      string,
      { name: string; variant: string; quantity: number; revenue: number }
    > = {};
    for (const item of items) {
      const key = item.productVariant.sku;
      const displayName = `${item.productVariant.product.name}${item.productVariant.size ? ` (${item.productVariant.size})` : ''}`;
      if (!products[key])
        products[key] = {
          name: displayName,
          variant: item.productVariant.sku,
          quantity: 0,
          revenue: 0,
        };
      products[key].quantity += item.quantity;
      products[key].revenue += Number(item.totalPrice);
    }

    return Object.values(products)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, params.limit || 10);
  },

  async inventoryValueTrend() {
    const movements = await prisma.stockMovement.findMany({
      where: { type: { in: ['PURCHASE', 'SALE', 'ADJUSTMENT', 'RETURN', 'DAMAGE'] } },
      select: {
        createdAt: true,
        quantity: true,
        productVariant: { select: { purchasePrice: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const daily: Record<string, number> = {};
    for (const m of movements) {
      const date = m.createdAt.toISOString().slice(0, 10);
      const value = Number(m.productVariant.purchasePrice) * Math.abs(m.quantity);
      daily[date] = (daily[date] || 0) + (m.quantity > 0 ? value : -value);
    }

    let cumulative = 0;
    return Object.entries(daily).map(([date, change]) => {
      cumulative += change;
      return { date, value: Math.max(0, cumulative) };
    });
  },
};
