import Link from 'next/link';
import { getDashboardStats, getLowStockProducts, getRecentMovements } from '@/lib/inventory';
import {
  Package,
  Boxes,
  AlertTriangle,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Plus,
  Download,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const lowStock = await getLowStockProducts();
  const recentMovements = await getRecentMovements(8);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your inventory</p>
        </div>
        <div className="page-actions">
          <Link href="/products/new" className="btn btn-primary">
            <Plus size={16} />
            Add Product
          </Link>
          <a href="/api/export" className="btn btn-ghost">
            <Download size={16} />
            Export CSV
          </a>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card accent">
          <div className="stat-icon accent">
            <Package size={20} />
          </div>
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{stats.totalProducts}</div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon success">
            <Boxes size={20} />
          </div>
          <div className="stat-label">Total Units in Stock</div>
          <div className="stat-value">{stats.totalStock.toLocaleString()}</div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon warning">
            <AlertTriangle size={20} />
          </div>
          <div className="stat-label">Low Stock Alerts</div>
          <div className="stat-value">{stats.lowStockCount}</div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon info">
            <Tag size={20} />
          </div>
          <div className="stat-label">Categories</div>
          <div className="stat-value">{stats.totalCategories}</div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid-2">
        {/* Low Stock Alerts */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Low Stock Alerts</h2>
              <p className="card-subtitle">Products below reorder threshold</p>
            </div>
            <span className="badge badge-warning">{lowStock.length}</span>
          </div>

          {lowStock.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <div className="text-sm text-secondary">All products are well-stocked! ✨</div>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Stock</th>
                    <th>Threshold</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.slice(0, 6).map((p) => (
                    <tr key={p.id}>
                      <td>
                        <Link href={`/products/${p.id}`} className="link">
                          <div className="font-semibold">{p.name}</div>
                          <div className="text-xs text-muted">{p.sku}</div>
                        </Link>
                      </td>
                      <td>
                        <div className="stock-level">
                          <span className="stock-dot low" />
                          <span className="text-danger font-semibold">{p.stock}</span>
                        </div>
                      </td>
                      <td className="text-secondary">{p.reorderAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Movements */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Recent Activity</h2>
              <p className="card-subtitle">Latest stock movements</p>
            </div>
            <Link href="/movements" className="btn btn-ghost btn-sm">
              View all
            </Link>
          </div>

          {recentMovements.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <div className="text-sm text-secondary">No stock movements yet.</div>
            </div>
          ) : (
            <div className="timeline">
              {recentMovements.map((m) => (
                <div key={m.id} className="timeline-item">
                  <div
                    className={`timeline-badge ${
                      m.type === 'IN' ? 'in' : m.type === 'OUT' ? 'out' : 'adjustment'
                    }`}
                  >
                    {m.type === 'IN' ? (
                      <ArrowDownRight size={16} />
                    ) : m.type === 'OUT' ? (
                      <ArrowUpRight size={16} />
                    ) : (
                      <RefreshCw size={14} />
                    )}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-title">
                      {m.type === 'IN' ? '+' : m.type === 'OUT' ? '-' : ''}
                      {Math.abs(m.quantity)} × {m.product.name}
                    </div>
                    <div className="timeline-subtitle">{m.reason}</div>
                  </div>
                  <div className="timeline-time">{formatDate(m.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
