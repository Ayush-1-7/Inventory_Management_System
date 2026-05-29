import React, { useState, useEffect } from 'react';

/**
 * ProductForm — Modal for creating or editing a product.
 * Props:
 *   product   — null for create, object for edit
 *   onClose   — close the modal
 *   onSave    — (formData) => Promise  — called on submit
 */
export default function ProductForm({ product, onClose, onSave }) {
  const isEdit = !!product;

  const [form, setForm] = useState({
    name: '',
    sku: '',
    price: '',
    quantity_in_stock: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        sku: product.sku,
        price: String(product.price),
        quantity_in_stock: String(product.quantity_in_stock),
      });
    }
  }, [product]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.sku.trim()) e.sku = 'SKU is required';
    if (!form.price || Number(form.price) <= 0) e.price = 'Price must be > 0';
    if (form.quantity_in_stock === '' || Number(form.quantity_in_stock) < 0)
      e.quantity_in_stock = 'Stock must be ≥ 0';
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
        name: form.name.trim(),
        sku: form.sku.trim(),
        price: parseFloat(form.price),
        quantity_in_stock: parseInt(form.quantity_in_stock, 10),
      });
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{isEdit ? 'Edit Product' : 'Add Product'}</h2>
          <button className="modal-x" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {apiError && <div className="api-error">{apiError}</div>}

            <div className="form-group">
              <label htmlFor="pf-name">Product Name</label>
              <input id="pf-name" placeholder="e.g. Wireless Mouse" value={form.name} onChange={set('name')} />
              {errors.name && <div className="field-error">{errors.name}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="pf-sku">SKU</label>
              <input id="pf-sku" placeholder="e.g. WM-001" value={form.sku} onChange={set('sku')} />
              {errors.sku && <div className="field-error">{errors.sku}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="pf-price">Price ($)</label>
              <input id="pf-price" type="number" step="0.01" min="0.01" placeholder="0.00" value={form.price} onChange={set('price')} />
              {errors.price && <div className="field-error">{errors.price}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="pf-stock">Quantity in Stock</label>
              <input id="pf-stock" type="number" min="0" placeholder="0" value={form.quantity_in_stock} onChange={set('quantity_in_stock')} />
              {errors.quantity_in_stock && <div className="field-error">{errors.quantity_in_stock}</div>}
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
