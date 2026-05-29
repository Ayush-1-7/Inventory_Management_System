// c:\Users\anujc\Downloads\inventory-management-system\frontend\src\pages\Products.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import ProductForm from '../components/ProductForm';

export default function Products({ toast }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProducts = useCallback(() => {
    api
      .get('/api/products')
      .then((r) => setProducts(r.data))
      .catch((err) => toast(err.response?.data?.detail || 'Failed to load products', 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setBulkResult(null);

    try {
      const response = await api.post('/api/products/bulk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setBulkResult(response.data);
      toast(response.data.message || 'CSV imported successfully');
      fetchProducts();
    } catch (err) {
      setBulkResult({
        error: err.response?.data?.detail || 'Upload failed',
        errors: err.response?.data?.errors || [],
      });
      toast(err.response?.data?.detail || 'CSV upload failed', 'error');
    } finally {
      setUploading(false);
      e.target.value = ''; // reset file input
    }
  };

  const openCreate = () => { setEditing(null); setShowForm(true); };
  const openEdit = (p) => { setEditing(p); setShowForm(true); };

  const handleSave = async (data) => {
    if (editing) {
      await api.put(`/api/products/${editing.id}`, data);
      toast('Product updated');
    } else {
      await api.post('/api/products', data);
      toast('Product created');
    }
    setShowForm(false);
    fetchProducts();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      toast('Product deleted');
      fetchProducts();
    } catch (err) {
      toast(err.response?.data?.detail || 'Delete failed', 'error');
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
  });

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header">
        <h1>Products</h1>
        <p>Manage your product inventory</p>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <h2>All Products ({products.length})</h2>
          <div className="flex items-center gap-md">
            <input
              type="text"
              placeholder="Search products..."
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
            <a href="/products_template.csv" download className="btn btn-ghost btn-sm">
              📋 Template
            </a>
            <label htmlFor="csv-upload" className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
              {uploading ? 'Uploading...' : '📂 Import CSV'}
            </label>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleBulkUpload}
              style={{ display: 'none' }}
              disabled={uploading}
            />
            <button id="add-product-btn" className="btn btn-primary btn-sm" onClick={openCreate}>
              + Add Product
            </button>
          </div>
        </div>

        {bulkResult && (
          <div style={{
            margin: '1.25rem',
            marginBottom: '0',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: `1px solid ${bulkResult.error ? 'rgba(248, 113, 113, 0.2)' : 'rgba(52, 211, 153, 0.2)'}`,
            background: bulkResult.error ? 'var(--danger-bg)' : 'var(--success-bg)',
            color: bulkResult.error ? 'var(--danger)' : 'var(--success)',
            fontSize: '0.85rem',
            position: 'relative'
          }}>
            <button 
              onClick={() => setBulkResult(null)}
              style={{
                position: 'absolute',
                top: '8px',
                right: '12px',
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                fontSize: '1.1rem',
                opacity: 0.7
              }}
              title="Dismiss"
            >
              &times;
            </button>
            <div style={{ paddingRight: '20px' }}>
              {bulkResult.error ? (
                <div><strong>Import Failed:</strong> {bulkResult.error}</div>
              ) : (
                <div>
                  <strong>Import Result:</strong> {bulkResult.message}
                </div>
              )}
              {bulkResult.errors && bulkResult.errors.length > 0 && (
                <ul style={{ marginTop: '8px', paddingLeft: '20px', color: 'var(--danger)', listStyleType: 'disc' }}>
                  {bulkResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {products.length === 0 ? (
          <div className="empty">
            <h3>No products yet</h3>
            <p>Add your first product to get started.</p>
            <button className="btn btn-primary" onClick={openCreate}>+ Add Product</button>
          </div>
        ) : (
          <>
            {filteredProducts.length === 0 ? (
              <div className="empty">
                <h3>No matching products found</h3>
                <p>Try adjusting your search query.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>SKU</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 500 }}>{p.name}</td>
                        <td className="font-mono">{p.sku}</td>
                        <td>${p.price.toFixed(2)}</td>
                        <td>{p.quantity_in_stock}</td>
                        <td>
                          {p.quantity_in_stock === 0 ? (
                            <span className="badge badge-danger">Out of Stock</span>
                          ) : p.quantity_in_stock <= 5 ? (
                            <span className="badge badge-warning">Low Stock</span>
                          ) : (
                            <span className="badge badge-success">In Stock</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="flex items-center gap-sm" style={{ justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
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

      {showForm && (
        <ProductForm
          product={editing}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
