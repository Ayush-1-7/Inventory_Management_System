import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getProductStock } from '@/lib/inventory';
import {
  ArrowLeft,
  Edit3,
  TrendingUp,
  Package,
  Boxes,
  AlertTriangle,
  Tag,
  DollarSign,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import StockBadge from '@/components/StockBadge';
import DeleteProductButton from '@/components/DeleteProductButton';

export const dynamic = 'force-dynamic';

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default async function ProductDetailsPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id, isActive: true },
    include: {
      movements: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!product) {
    notFound();
  }

  const stock = await getProductStock(product.id);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <h1 className="page-title">{product.name}</h1>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.25rem' }}>
              <span className="badge badge-info" style={{ fontWeight: 600 }}>{product.sku}</span>
              <StockBadge stock={stock} reorderAt={product.reorderAt} />
            </div>
          </div>
        </div>
        <div className="page-actions">
          <Link href="/products" className="btn btn-ghost">
            <ArrowLeft size={16} />
            Back to Products
          </Link>
          <Link href={`/products/${product.id}/edit`} className="btn btn-ghost">
            <Edit3 size={16} />
            Edit
          </Link>
          <Link href={`/products/${product.id}/stock`} className="btn btn-primary">
            <TrendingUp size={16} />
            Adjust Stock
          </Link>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        {/* Current Stock Card */}
        <div className="stat-card success">
          <div className="stat-icon success">
            <Boxes size={20} />
          </div>
          <div className="stat-label">Current Inventory</div>
          <div className="stat-value">
            {stock.toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{product.unit}</span>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="stat-card accent">
          <div className="stat-icon accent">
            <DollarSign size={20} />
          </div>
          <div className="stat-label">Unit Price</div>
          <div className="stat-value">
            ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Threshold Card */}
        <div className="stat-card warning">
          <div className="stat-icon warning">
            <AlertTriangle size={20} />
          </div>
          <div className="stat-label">Reorder Threshold</div>
          <div className="stat-value">
            {product.reorderAt} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{product.unit}</span>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Specifications & Details */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Product Details</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {product.description && (
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Description</div>
                <div style={{ color: 'var(--text-primary)', lineHeight: 1.5, fontSize: '0.95rem' }}>{product.description}</div>
              </div>
            )}

            <div className="grid" style={{ rowGap: '1rem', margin: 0, width: '100%' }}>
              <div className="col-6" style={{ padding: 0 }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>Category</div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  {product.category ? <span className="badge badge-info">{product.category}</span> : 'Uncategorized'}
                </div>
              </div>
              <div className="col-6" style={{ padding: 0 }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>Unit of Measure</div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{product.unit}</div>
              </div>
              <div className="col-6" style={{ padding: 0 }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>Created At</div>
                <div style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
                  <Calendar size={14} className="text-secondary" />
                  {formatDate(product.createdAt)}
                </div>
              </div>
              <div className="col-6" style={{ padding: 0 }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>Last Updated</div>
                <div style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
                  <Calendar size={14} className="text-secondary" />
                  {formatDate(product.updatedAt)}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: '1rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-primary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Danger Zone</span>
              <DeleteProductButton productId={product.id} productName={product.name} />
            </div>
          </div>
        </div>

        {/* Stock Movements Timeline */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Stock Movements</h2>
            <span className="badge badge-info">{product.movements.length} logged</span>
          </div>

          {product.movements.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No stock movements have been recorded for this product yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '450px', overflowY: 'auto', paddingRight: '4px' }}>
              {product.movements.map((mov) => {
                const isPositive = mov.quantity > 0;
                return (
                  <div
                    key={mov.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-primary)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: isPositive ? 'var(--success)' : 'var(--danger)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{mov.reason}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {formatDate(mov.createdAt)}
                          {mov.reference && ` • Ref: ${mov.reference}`}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        color: isPositive ? 'var(--success)' : 'var(--danger)',
                      }}
                    >
                      {isPositive ? '+' : ''}
                      {mov.quantity}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
