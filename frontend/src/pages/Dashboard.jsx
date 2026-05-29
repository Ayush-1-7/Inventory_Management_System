// c:\Users\anujc\Downloads\inventory-management-system\frontend\src\pages\Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
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
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
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
        <div className="card stat-card">
          <div className="stat-icon orange">💰</div>
          <div className="stat-value">
            ${stats.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="stat-label">Total Revenue</div>
        </div>
      </div>

      {/* Charts section */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', marginBottom: '1.5rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Top 5 Selling Products</h3>
          <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {stats.top_products.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No product sales data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.top_products} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'var(--bg-tertiary)', 
                      border: '1px solid var(--border)', 
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)'
                    }} 
                  />
                  <Bar dataKey="total_quantity_sold" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Orders Per Day (Last 7 Days)</h3>
          <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {stats.total_orders === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No orders placed yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.orders_per_day} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'var(--bg-tertiary)', 
                      border: '1px solid var(--border)', 
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)'
                    }} 
                  />
                  <Line type="monotone" dataKey="count" stroke="var(--success)" strokeWidth={3} dot={{ fill: 'var(--success)', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
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
