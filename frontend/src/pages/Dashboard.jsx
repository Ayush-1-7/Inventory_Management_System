import React, { useState, useEffect } from 'react';
import api from '../api/client';

export default function Dashboard({ toast }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/dashboard')
      .then((r) => setStats(r.data))
      .catch((err) => toast(err.response?.data?.detail || 'Failed to load dashboard', 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  if (!stats) {
    return (
      <div className="empty">
        <h3>Unable to load dashboard</h3>
        <p>Please check that the backend is running.</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your inventory and order metrics</p>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon purple">📦</div>
          <div className="stat-value">{stats.total_products}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon green">👥</div>
          <div className="stat-value">{stats.total_customers}</div>
          <div className="stat-label">Total Customers</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon blue">📋</div>
          <div className="stat-value">{stats.total_orders}</div>
          <div className="stat-label">Total Orders</div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="table-card">
        <div className="table-toolbar">
          <h2>⚠️ Low Stock Alerts</h2>
          <span className="badge badge-warning">Stock ≤ 5</span>
        </div>
        {stats.low_stock_products.length === 0 ? (
          <div className="empty">
            <h3>All stocked up!</h3>
            <p>No products are below the low-stock threshold.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {stats.low_stock_products.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td className="font-mono">{p.sku}</td>
                    <td>
                      {p.quantity_in_stock === 0 ? (
                        <span className="low-stock-zero">Out of Stock</span>
                      ) : (
                        <span className="badge badge-warning">{p.quantity_in_stock} left</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
