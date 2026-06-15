'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, ArrowUpDown, Edit3, Trash2, Eye, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import SearchBar from '@/components/SearchBar';
import StockBadge from '@/components/StockBadge';
import DeleteProductButton from '@/components/DeleteProductButton';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string | null;
  reorderAt: number;
  description: string | null;
  unit: string;
  price: number;
  imageUrl: string | null;
  stock: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [, startTransition] = useTransition();

  // Fetch unique categories
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  const fetchProducts = () => {
    setLoading(true);
    const query = new URLSearchParams({
      search,
      category,
      sort,
      order,
    });

    fetch(`/api/products?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.products) {
          setProducts(data.products);
        }
      })
      .catch((err) => {
        toast.error('Failed to load products');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, [search, category, sort, order]);

  const toggleSort = (field: string) => {
    if (sort === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(field);
      setOrder('asc');
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage your inventory products and catalog</p>
        </div>
        <div className="page-actions">
          <button onClick={fetchProducts} className="btn btn-ghost" style={{ padding: '8px 12px' }}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link href="/products/new" className="btn btn-primary">
            <Plus size={16} />
            Add Product
          </Link>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or SKU..." />

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} className="text-secondary" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-input"
              style={{ padding: '6px 12px', minWidth: '160px', margin: 0 }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading && products.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <RefreshCw size={32} className="animate-spin text-secondary" />
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
            <p className="text-secondary" style={{ marginBottom: '1rem' }}>
              No products found. Add some products or modify your search filters.
            </p>
            <Link href="/products/new" className="btn btn-primary">
              Create a Product
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('sku')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      SKU <ArrowUpDown size={12} />
                    </span>
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('name')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      Product <ArrowUpDown size={12} />
                    </span>
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('category')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      Category <ArrowUpDown size={12} />
                    </span>
                  </th>
                  <th style={{ cursor: 'pointer', textAlign: 'right' }} onClick={() => toggleSort('price')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end', width: '100%' }}>
                      Price <ArrowUpDown size={12} />
                    </span>
                  </th>
                  <th style={{ textAlign: 'center' }}>Stock Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="animate-fadeIn">
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.sku}</td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{p.name}</div>
                        {p.description && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {p.category ? (
                        <span className="badge badge-info">{p.category}</span>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>-</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      ${p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <StockBadge stock={p.stock} reorderAt={p.reorderAt} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <Link href={`/products/${p.id}`} className="btn btn-ghost" style={{ padding: '6px 8px' }} title="View Product Details">
                          <Eye size={15} />
                        </Link>
                        <Link href={`/products/${p.id}/edit`} className="btn btn-ghost" style={{ padding: '6px 8px' }} title="Edit Product">
                          <Edit3 size={15} />
                        </Link>
                        <DeleteProductButton productId={p.id} productName={p.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
