import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Tag, FolderOpen, ArrowRight, Layers, LayoutGrid } from 'lucide-react';
import React from 'react';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  // Aggregate product counts and stock per category
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      category: true,
      id: true,
      movements: {
        select: {
          quantity: true,
        },
      },
    },
  });

  const categoryMap: Record<string, { productCount: number; totalStock: number }> = {};

  products.forEach((p) => {
    const catName = p.category ? p.category.trim() : 'Uncategorized';
    const stock = p.movements.reduce((sum, m) => sum + m.quantity, 0);

    if (!categoryMap[catName]) {
      categoryMap[catName] = { productCount: 0, totalStock: 0 };
    }

    categoryMap[catName].productCount += 1;
    categoryMap[catName].totalStock += stock;
  });

  const categories = Object.entries(categoryMap).map(([name, stats]) => ({
    name,
    ...stats,
  })).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Groupings and metrics for your product inventory</p>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <FolderOpen size={48} className="text-secondary" style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3 style={{ margin: '0 0 0.5rem 0' }}>No categories found</h3>
          <p className="text-secondary" style={{ maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
            Products must be created with a category name to show up here.
          </p>
          <Link href="/products/new" className="btn btn-primary">
            Create Product with Category
          </Link>
        </div>
      ) : (
        <div className="grid-3">
          {categories.map((cat) => {
            const isUncategorized = cat.name === 'Uncategorized';
            return (
              <div
                key={cat.name}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '180px',
                  transition: 'all 0.3s ease',
                  border: '1px solid var(--border-primary)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Decorative glow */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-40px',
                    right: '-40px',
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(99, 102, 241, 0.04)',
                    filter: 'blur(20px)',
                    pointerEvents: 'none',
                  }}
                />

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: isUncategorized ? 'rgba(148, 163, 184, 0.08)' : 'rgba(99, 102, 241, 0.08)',
                        color: isUncategorized ? 'var(--text-secondary)' : 'var(--accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Tag size={16} />
                    </div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '1.15rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {cat.name}
                    </h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Products
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {cat.productCount}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Total Stock
                      </div>
                      <div
                        style={{
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          color: cat.totalStock <= 0 ? 'var(--danger)' : 'var(--success)',
                        }}
                      >
                        {cat.totalStock.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '1rem' }}>
                  <Link
                    href={`/products?category=${isUncategorized ? '' : encodeURIComponent(cat.name)}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      color: 'var(--accent)',
                      textDecoration: 'none',
                    }}
                    className="group"
                  >
                    <span>View items in category</span>
                    <ArrowRight size={14} style={{ transition: 'transform 0.2s ease' }} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
