import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getProductStock } from '@/lib/inventory';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    select: { id: true, sku: true },
  });
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const stock = await getProductStock(params.id);

  const movements = await prisma.stockMovement.findMany({
    where: { productId: params.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({ productId: product.id, stock, movements });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { quantity, reason, type, reference } = body as {
    quantity?: number;
    reason?: string;
    type?: 'IN' | 'OUT' | 'ADJUSTMENT';
    reference?: string;
  };

  if (typeof quantity !== 'number' || quantity === 0 || !reason) {
    return NextResponse.json(
      { error: 'quantity (non-zero number) and reason are required' },
      { status: 400 }
    );
  }

  const product = await prisma.product.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const movementType = type || (quantity > 0 ? 'IN' : 'OUT');

  const movement = await prisma.stockMovement.create({
    data: {
      productId: params.id,
      quantity,
      reason,
      type: movementType,
      reference: reference || null,
    },
    select: { id: true, quantity: true, reason: true, type: true, createdAt: true },
  });

  const stock = await getProductStock(params.id);
  return NextResponse.json({ movement, stock }, { status: 201 });
}
