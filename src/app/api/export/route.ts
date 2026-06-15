import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
      include: {
        movements: {
          select: {
            quantity: true,
          },
        },
      },
    });

    // Generate CSV content
    const headers = ['SKU', 'Name', 'Category', 'Price', 'Stock', 'Unit', 'Reorder Level', 'Description'];
    const rows = products.map((p) => {
      const stock = p.movements.reduce((acc, mov) => acc + mov.quantity, 0);
      return [
        p.sku,
        p.name,
        p.category || '',
        p.price.toString(),
        stock.toString(),
        p.unit,
        p.reorderAt.toString(),
        p.description ? p.description.replace(/"/g, '""') : '',
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((val) => `"${val}"`).join(',')),
    ].join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="inventory_export.csv"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to export inventory' }, { status: 500 });
  }
}
