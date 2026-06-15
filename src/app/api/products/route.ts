import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getProductStock } from '@/lib/inventory';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const search = url.searchParams.get('search') || '';
  const category = url.searchParams.get('category') || '';
  const sort = url.searchParams.get('sort') || 'createdAt';
  const order = url.searchParams.get('order') === 'asc' ? 'asc' : 'desc';

  const where: Record<string, unknown> = { isActive: true };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (category) {
    where.category = category;
  }

  const orderBy: Record<string, string> = {};
  if (['name', 'sku', 'category', 'createdAt', 'price'].includes(sort)) {
    orderBy[sort] = order;
  } else {
    orderBy.createdAt = 'desc';
  }

  const products = await prisma.product.findMany({
    where,
    orderBy,
    select: {
      id: true,
      name: true,
      sku: true,
      category: true,
      reorderAt: true,
      description: true,
      unit: true,
      price: true,
      imageUrl: true,
    },
  });

  const productsWithStock = await Promise.all(
    products.map(async (p) => ({
      ...p,
      stock: await getProductStock(p.id),
    }))
  );

  return NextResponse.json({ products: productsWithStock });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, sku, description, category, reorderAt, unit, price, imageUrl } = body as {
    name?: string;
    sku?: string;
    description?: string;
    category?: string;
    reorderAt?: number;
    unit?: string;
    price?: number;
    imageUrl?: string;
  };

  if (!name || !sku) {
    return NextResponse.json({ error: 'name and sku are required' }, { status: 400 });
  }

  // Check for duplicate SKU
  const existing = await prisma.product.findUnique({ where: { sku } });
  if (existing) {
    return NextResponse.json({ error: 'A product with this SKU already exists' }, { status: 409 });
  }

  const product = await prisma.product.create({
    data: {
      name,
      sku,
      description: description ?? null,
      category: category || null,
      reorderAt: typeof reorderAt === 'number' ? reorderAt : 0,
      unit: unit || 'pcs',
      price: typeof price === 'number' ? price : 0,
      imageUrl: imageUrl || null,
    },
    select: { id: true, name: true, sku: true },
  });

  return NextResponse.json({ product }, { status: 201 });
}
