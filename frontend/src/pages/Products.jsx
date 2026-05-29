import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import ProductForm from '../components/ProductForm';

export default function Products({ toast }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchProducts = useCallback(() => {
    api
      .get('/api/products')
      .then((r) => setProducts(r.data))
      .catch((err) => toast(err.response?.data?.detail || 'Failed to load products', 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

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
          <button id="add-product-btn" className="btn btn-primary" onClick={openCreate}>
            + Add Product
          </button>
        </div>

        {products.length === 0 ? (
          <div className="empty">
            <h3>No products yet</h3>
            <p>Add your first product to get started.</p>
            <button className="btn btn-primary" onClick={openCreate}>+ Add Product</button>
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
                {products.map((p) => (
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
