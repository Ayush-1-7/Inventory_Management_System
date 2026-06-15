import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getProductStock } from '@/lib/inventory';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      movements: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const stock = await getProductStock(params.id);

  return NextResponse.json({ product: { ...product, stock } });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { name, sku, description, category, reorderAt, unit, price, imageUrl } = body as {
    name?: string;
    sku?: string;
    description?: string | null;
    category?: string | null;
    reorderAt?: number;
    unit?: string;
    price?: number;
    imageUrl?: string | null;
  };

  const existing = await prisma.product.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Check SKU uniqueness if changed
  if (sku && sku !== existing.sku) {
    const skuExists = await prisma.product.findUnique({ where: { sku } });
    if (skuExists) {
      return NextResponse.json({ error: 'SKU already exists' }, { status: 409 });
    }
  }

  const updated = await prisma.product.update({
    where: { id: params.id },
    data: {
      name: name ?? existing.name,
      sku: sku ?? existing.sku,
      description: description === undefined ? existing.description : (description ?? null),
      category: category === undefined ? existing.category : (category ?? null),
      reorderAt: typeof reorderAt === 'number' ? reorderAt : existing.reorderAt,
      unit: unit ?? existing.unit,
      price: typeof price === 'number' ? price : existing.price,
      imageUrl: imageUrl === undefined ? existing.imageUrl : (imageUrl ?? null),
    },
    select: { id: true, name: true, sku: true },
  });

  return NextResponse.json({ product: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
}
