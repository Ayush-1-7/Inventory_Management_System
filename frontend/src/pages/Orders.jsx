// c:\Users\anujc\Downloads\inventory-management-system\frontend\src\pages\Orders.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import OrderForm from '../components/OrderForm';

export default function Orders({ toast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = useCallback(() => {
    api
      .get('/api/orders')
      .then((r) => setOrders(r.data))
      .catch((err) => toast(err.response?.data?.detail || 'Failed to load orders', 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleCreateOrder = async (payload) => {
    await api.post('/api/orders', payload);
    toast('Order created');
    setShowCreate(false);
    fetchOrders();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status: newStatus });
      toast('Order status updated');
      fetchOrders();
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to update status', 'error');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this order? Stock will be restored.')) return;
    try {
      await api.delete(`/api/orders/${id}`);
      toast('Order cancelled — stock restored');
      fetchOrders();
    } catch (err) {
      toast(err.response?.data?.detail || 'Cancel failed', 'error');
    }
  };

  const openDetail = async (id) => {
    try {
      const { data } = await api.get(`/api/orders/${id}`);
      setViewOrder(data);
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to load order', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-warning">pending</span>;
      case 'processing':
        return <span className="badge badge-info">processing</span>;
      case 'shipped':
        return (
          <span 
            className="badge" 
            style={{ 
              background: 'rgba(99, 102, 241, 0.15)', 
              color: 'var(--accent-hover)', 
              border: '1px solid rgba(99, 102, 241, 0.25)' 
            }}
          >
            shipped
          </span>
        );
      case 'delivered':
        return <span className="badge badge-success">delivered</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    const customerName = (o.customer_name || '').toLowerCase();
    const orderIdStr = String(o.id);
    
    const matchesSearch = customerName.includes(q) || orderIdStr.includes(q);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header">
        <h1>Orders</h1>
        <p>Track and manage customer orders</p>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <h2>All Orders ({orders.length})</h2>
          <div className="flex items-center gap-md">
            <input
              type="text"
              placeholder="Search ID or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '180px',
                padding: '0.35rem 0.75rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '0.8rem'
              }}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.35rem 0.75rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
            <button id="create-order-btn" className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
              + Create Order
            </button>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="empty">
            <h3>No orders yet</h3>
            <p>Create your first order to get started.</p>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create Order</button>
          </div>
        ) : (
          <>
            {filteredOrders.length === 0 ? (
              <div className="empty">
                <h3>No matching orders found</h3>
                <p>Try adjusting your search query or filters.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o) => (
                      <tr key={o.id}>
                        <td><span className="badge badge-info">#{o.id}</span></td>
                        <td style={{ fontWeight: 500 }}>{o.customer_name || `#${o.customer_id}`}</td>
                        <td>{o.item_count} item(s)</td>
                        <td style={{ fontWeight: 600 }}>${o.total_amount.toFixed(2)}</td>
                        <td>
                          {getStatusBadge(o.status)}
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>
                          {new Date(o.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="flex items-center gap-sm" style={{ justifyContent: 'flex-end' }}>
                            <select
                              value={o.status}
                              onChange={(e) => handleStatusChange(o.id, e.target.value)}
                              style={{
                                padding: '0.25rem 0.5rem',
                                background: 'var(--bg-input)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-primary)',
                                fontSize: '0.75rem',
                                outline: 'none',
                                cursor: 'pointer',
                                marginRight: '0.25rem'
                              }}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                            </select>
                            <button className="btn btn-ghost btn-sm" onClick={() => openDetail(o.id)}>View</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleCancel(o.id)}>Cancel</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Order */}
      {showCreate && (
        <OrderForm
          onClose={() => setShowCreate(false)}
          onSave={handleCreateOrder}
        />
      )}

      {/* Order Detail Modal */}
      {viewOrder && (
        <div className="modal-backdrop" onClick={() => setViewOrder(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 620 }}>
            <div className="modal-head">
              <h2>Order #{viewOrder.id}</h2>
              <button className="modal-x" onClick={() => setViewOrder(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div>
                  <div className="detail-label">Customer</div>
                  <div className="detail-value">{viewOrder.customer_name || `#${viewOrder.customer_id}`}</div>
                </div>
                <div>
                  <div className="detail-label">Date</div>
                  <div className="detail-value">{new Date(viewOrder.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <div className="detail-label">Status</div>
                  <div className="detail-value">
                    {getStatusBadge(viewOrder.status)}
                  </div>
                </div>
                <div>
                  <div className="detail-label">Total</div>
                  <div className="detail-value" style={{ color: 'var(--success)' }}>
                    ${viewOrder.total_amount.toFixed(2)}
                  </div>
                </div>
              </div>

              <h3 style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>Line Items</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Unit Price</th>
                      <th>Qty</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 500 }}>{item.product_name || `#${item.product_id}`}</td>
                        <td className="font-mono">{item.product_sku || '—'}</td>
                        <td>${item.unit_price.toFixed(2)}</td>
                        <td>{item.quantity}</td>
                        <td style={{ fontWeight: 600 }}>${(item.unit_price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setViewOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
