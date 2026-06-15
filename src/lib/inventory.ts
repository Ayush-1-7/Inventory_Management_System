import { prisma } from './prisma';

export async function getProductStock(productId: string) {
  const agg = await prisma.stockMovement.aggregate({
    where: { productId },
    _sum: { quantity: true },
  });
  return agg._sum.quantity ?? 0;
}

export async function getLowStockProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      sku: true,
      reorderAt: true,
      category: true,
    },
  });

  const results: Array<{
    id: string;
    name: string;
    sku: string;
    category: string | null;
    stock: number;
    reorderAt: number;
  }> = [];

  for (const p of products) {
    const stock = await getProductStock(p.id);
    if (stock <= p.reorderAt) {
      results.push({ ...p, stock, reorderAt: p.reorderAt });
    }
  }

  results.sort((a, b) => a.stock - b.stock);
  return results;
}

export async function getDashboardStats() {
  const totalProducts = await prisma.product.count({ where: { isActive: true } });

  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, reorderAt: true },
  });

  let totalStock = 0;
  let lowStockCount = 0;

  for (const p of products) {
    const stock = await getProductStock(p.id);
    totalStock += stock;
    if (stock <= p.reorderAt) lowStockCount++;
  }

  const categories = await prisma.product.groupBy({
    by: ['category'],
    where: { isActive: true },
    _count: true,
  });

  const totalCategories = categories.filter((c) => c.category !== null).length;

  return {
    totalProducts,
    totalStock,
    lowStockCount,
    totalCategories,
  };
}

export async function getRecentMovements(limit = 10) {
  const movements = await prisma.stockMovement.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      product: {
        select: { name: true, sku: true },
      },
    },
  });

  return movements;
}
