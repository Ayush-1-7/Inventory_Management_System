'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, RefreshCw, Calendar, FileText, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface Movement {
  id: string;
  productId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  reference: string | null;
  createdAt: string;
  product: {
    name: string;
    sku: string;
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function MovementsPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 25, totalPages: 1 });

  const fetchMovements = (page = 1) => {
    setLoading(true);
    const query = new URLSearchParams({
      type: typeFilter,
      page: page.toString(),
      limit: '25',
    });

    fetch(`/api/movements?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.movements) {
          setMovements(data.movements);
          setPagination(data.pagination);
        }
      })
      .catch((err) => {
        toast.error('Failed to load stock movements');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMovements(1);
  }, [typeFilter]);

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock Movements</h1>
          <p className="page-subtitle">Historical audit trail of all inventory additions and withdrawals</p>
        </div>
        <div className="page-actions">
          <button onClick={() => fetchMovements(pagination.page)} className="btn btn-ghost" style={{ padding: '8px 12px' }}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Filter Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="form-input"
            style={{ padding: '6px 12px', minWidth: '160px', margin: 0 }}
          >
            <option value="">All Movements</option>
            <option value="IN">Incoming (IN)</option>
            <option value="OUT">Outgoing (OUT)</option>
            <option value="ADJUSTMENT">Adjustments</option>
          </select>
        </div>
      </div>

      {/* Movements Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading && movements.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <RefreshCw size={32} className="animate-spin text-secondary" />
          </div>
        ) : movements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-secondary)' }}>
            No stock movements found matching the criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Qty Changed</th>
                  <th>Reason / Details</th>
                  <th>Ref Reference</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((mov) => {
                  const isPositive = mov.quantity > 0;
                  return (
                    <tr key={mov.id} className="animate-fadeIn">
                      <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Calendar size={13} className="text-secondary" />
                          {formatDate(mov.createdAt)}
                        </span>
                      </td>
                      <td>
                        <Link href={`/products/${mov.productId}`} className="link" style={{ fontWeight: 600 }}>
                          {mov.product.name}
                        </Link>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{mov.product.sku}</td>
                      <td>
                        <span className={`badge ${mov.type === 'IN' ? 'badge-success' : mov.type === 'OUT' ? 'badge-danger' : 'badge-warning'}`}>
                          {mov.type}
                        </span>
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 700,
                          color: isPositive ? 'var(--success)' : 'var(--danger)',
                        }}
                      >
                        {isPositive ? '+' : ''}
                        {mov.quantity}
                      </td>
                      <td style={{ fontSize: '0.9rem' }}>{mov.reason}</td>
                      <td>
                        {mov.reference ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            <FileText size={12} />
                            {mov.reference}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)' }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button
            className="btn btn-ghost"
            disabled={pagination.page <= 1}
            onClick={() => fetchMovements(pagination.page - 1)}
          >
            Previous
          </button>
          <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            className="btn btn-ghost"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchMovements(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
