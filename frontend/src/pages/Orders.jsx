import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import OrderForm from '../components/OrderForm';

export default function Orders({ toast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);

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
          <button id="create-order-btn" className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + Create Order
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="empty">
            <h3>No orders yet</h3>
            <p>Create your first order to get started.</p>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create Order</button>
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
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td><span className="badge badge-info">#{o.id}</span></td>
                    <td style={{ fontWeight: 500 }}>{o.customer_name || `#${o.customer_id}`}</td>
                    <td>{o.item_count} item(s)</td>
                    <td style={{ fontWeight: 600 }}>${o.total_amount.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${o.status === 'pending' ? 'badge-warning' : 'badge-success'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex items-center gap-sm" style={{ justifyContent: 'flex-end' }}>
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
                    <span className={`badge ${viewOrder.status === 'pending' ? 'badge-warning' : 'badge-success'}`}>
                      {viewOrder.status}
                    </span>
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
