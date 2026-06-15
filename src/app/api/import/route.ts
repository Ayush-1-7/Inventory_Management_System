import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Papa from 'papaparse';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const text = await file.text();
    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      console.warn('CSV parsing errors:', parsed.errors);
    }

    const rows = parsed.data as Array<any>;
    let importedCount = 0;

    for (const row of rows) {
      const sku = (row.SKU || row.sku || '').trim();
      const name = (row.Name || row.name || '').trim();
      if (!sku || !name) continue;

      const category = (row.Category || row.category || '').trim();
      const unit = (row.Unit || row.unit || 'pcs').trim();
      const price = parseFloat(row.Price || row.price || '0') || 0;
      const reorderAt = parseInt(row.StockLevelThreshold || row['Reorder Level'] || row.reorderAt || '0', 10) || 0;
      const initialStock = parseInt(row.Stock || row.stock || '0', 10) || 0;
      const description = (row.Description || row.description || '').trim();

      // Upsert product by SKU
      const product = await prisma.product.upsert({
        where: { sku },
        update: {
          name,
          category: category || null,
          unit,
          price,
          reorderAt,
          description: description || null,
        },
        create: {
          sku,
          name,
          category: category || null,
          unit,
          price,
          reorderAt,
          description: description || null,
        },
      });

      // If stock is specified and there's a difference, create a stock movement adjustment
      if (initialStock > 0) {
        const currentAgg = await prisma.stockMovement.aggregate({
          where: { productId: product.id },
          _sum: { quantity: true },
        });
        const currentStock = currentAgg._sum.quantity ?? 0;
        const diff = initialStock - currentStock;

        if (diff !== 0) {
          await prisma.stockMovement.create({
            data: {
              productId: product.id,
              quantity: diff,
              type: diff > 0 ? 'IN' : 'OUT',
              reason: 'CSV Import Initial Stock Adjustment',
            },
          });
        }
      }

      importedCount++;
    }

    return NextResponse.json({ success: true, imported: importedCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to import CSV' }, { status: 500 });
  }
}
