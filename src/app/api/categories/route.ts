import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { category: true },
    });

    const categoriesSet = new Set<string>();
    products.forEach((p) => {
      if (p.category) {
        categoriesSet.add(p.category.trim());
      }
    });

    const categories = Array.from(categoriesSet).sort();
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch categories' }, { status: 500 });
  }
}
