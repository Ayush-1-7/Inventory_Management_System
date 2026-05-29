import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/client';

/**
 * OrderForm — Modal for creating an order.
 * Fetches customers & products on mount. Shows live-calculated total.
 *
 * Props:
 *   onClose — close modal
 *   onSave  — (payload) => Promise
 */
export default function OrderForm({ onClose, onSave }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: '1' }]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/api/customers').then((r) => setCustomers(r.data)).catch(() => {});
    api.get('/api/products').then((r) => setProducts(r.data)).catch(() => {});
  }, []);

  /* Build a lookup map: product_id → product */
  const productMap = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p])),
    [products]
  );

  /* Live-calculated order total preview */
  const previewTotal = useMemo(() => {
    let total = 0;
    for (const item of items) {
      const p = productMap[item.product_id];
      if (p && item.quantity > 0) total += p.price * Number(item.quantity);
    }
    return total;
  }, [items, productMap]);

  const addRow = () => setItems((prev) => [...prev, { product_id: '', quantity: '1' }]);

  const removeRow = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const updateRow = (idx, field, val) =>
    setItems((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: val } : r)));

  const validate = () => {
    const e = {};
    if (!customerId) e.customer = 'Select a customer';
    if (items.length === 0) e.items = 'Add at least one product';
    items.forEach((item, idx) => {
      if (!item.product_id) e[`p_${idx}`] = 'Select a product';
      if (!item.quantity || Number(item.quantity) <= 0) e[`q_${idx}`] = 'Qty > 0';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setApiError('');

    try {
      await onSave({
        customer_id: parseInt(customerId, 10),
        items: items.map((i) => ({
          product_id: parseInt(i.product_id, 10),
          quantity: parseInt(i.quantity, 10),
        })),
      });
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Failed to create order.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 620 }}>
        <div className="modal-head">
          <h2>Create Order</h2>
          <button className="modal-x" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {apiError && <div className="api-error">{apiError}</div>}

            {/* Customer */}
            <div className="form-group">
              <label htmlFor="of-customer">Customer</label>
              <select
                id="of-customer"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              >
                <option value="">Select a customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </option>
                ))}
              </select>
              {errors.customer && <div className="field-error">{errors.customer}</div>}
            </div>

            {/* Items */}
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Order Items
            </label>
            {errors.items && <div className="field-error" style={{ marginBottom: 6 }}>{errors.items}</div>}

            {items.map((item, idx) => {
              const selectedProduct = productMap[item.product_id];
              return (
                <div className="order-item-row" key={idx}>
                  <div className="form-group">
                    <label htmlFor={`of-prod-${idx}`}>Product</label>
                    <select
                      id={`of-prod-${idx}`}
                      value={item.product_id}
                      onChange={(e) => updateRow(idx, 'product_id', e.target.value)}
                    >
                      <option value="">Select…</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — ${p.price.toFixed(2)}
                        </option>
                      ))}
                    </select>
                    {selectedProduct && (
                      <div className="stock-hint">
                        Available: {selectedProduct.quantity_in_stock} units
                      </div>
                    )}
                    {errors[`p_${idx}`] && <div className="field-error">{errors[`p_${idx}`]}</div>}
                  </div>
                  <div className="form-group" style={{ maxWidth: 90 }}>
                    <label htmlFor={`of-qty-${idx}`}>Qty</label>
                    <input
                      id={`of-qty-${idx}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateRow(idx, 'quantity', e.target.value)}
                    />
                    {errors[`q_${idx}`] && <div className="field-error">{errors[`q_${idx}`]}</div>}
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger btn-icon"
                      onClick={() => removeRow(idx)}
                      title="Remove"
                      style={{ marginBottom: 0, flexShrink: 0 }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}

            <button type="button" className="btn btn-ghost btn-sm mt-sm" onClick={addRow}>
              + Add Item
            </button>

            {/* Live total */}
            <div className="order-total-preview">
              <span>Estimated Total</span>
              <span>${previewTotal.toFixed(2)}</span>
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Creating…' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
