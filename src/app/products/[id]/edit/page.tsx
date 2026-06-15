'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  category: string | null;
  unit: string;
  price: number;
  reorderAt: number;
  imageUrl: string | null;
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) {
          setProduct(data.product);
        } else {
          toast.error('Product not found');
        }
      })
      .catch((err) => {
        toast.error('Failed to load product');
        console.error(err);
      })
      .finally(() => {
        setFetching(false);
      });
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product) return;

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: String(formData.get('name') ?? '').trim(),
      sku: String(formData.get('sku') ?? '').trim().toUpperCase(),
      description: String(formData.get('description') ?? '').trim(),
      category: String(formData.get('category') ?? '').trim(),
      unit: String(formData.get('unit') ?? 'pcs').trim(),
      price: parseFloat(String(formData.get('price') || '0')),
      reorderAt: parseInt(String(formData.get('reorderAt') || '0'), 10),
      imageUrl: String(formData.get('imageUrl') ?? '').trim(),
    };

    if (!payload.name || !payload.sku) {
      toast.error('Name and SKU are required');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update product');
      }

      toast.success(`Product updated successfully!`);
      router.push(`/products/${product.id}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem 0' }}>
        <RefreshCw size={32} className="animate-spin text-secondary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p className="text-secondary">Product not found.</p>
        <Link href="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Edit Product</h1>
          <p className="page-subtitle">Update information for product: {product.name}</p>
        </div>
        <div className="page-actions">
          <Link href={`/products/${product.id}`} className="btn btn-ghost">
            <ArrowLeft size={16} />
            Back to Details
          </Link>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div className="grid">
            <div className="col-6">
              <label className="form-label" htmlFor="name">Product Name *</label>
              <input
                id="name"
                className="form-input"
                name="name"
                defaultValue={product.name}
                required
                disabled={loading}
              />
            </div>
            <div className="col-6">
              <label className="form-label" htmlFor="sku">SKU / Code *</label>
              <input
                id="sku"
                className="form-input"
                name="sku"
                defaultValue={product.sku}
                required
                disabled={loading}
              />
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="description">Description (optional)</label>
              <textarea
                id="description"
                className="form-input"
                name="description"
                defaultValue={product.description || ''}
                rows={4}
                disabled={loading}
              />
            </div>
            <div className="col-6">
              <label className="form-label" htmlFor="category">Category (optional)</label>
              <input
                id="category"
                className="form-input"
                name="category"
                defaultValue={product.category || ''}
                disabled={loading}
              />
            </div>
            <div className="col-6">
              <label className="form-label" htmlFor="unit">Unit of Measure</label>
              <input
                id="unit"
                className="form-input"
                name="unit"
                defaultValue={product.unit}
                required
                disabled={loading}
              />
            </div>
            <div className="col-6">
              <label className="form-label" htmlFor="price">Unit Price ($) *</label>
              <input
                id="price"
                className="form-input"
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product.price}
                required
                disabled={loading}
              />
            </div>
            <div className="col-6">
              <label className="form-label" htmlFor="reorderAt">Low Stock Alert Threshold</label>
              <input
                id="reorderAt"
                className="form-input"
                name="reorderAt"
                type="number"
                min="0"
                defaultValue={product.reorderAt}
                required
                disabled={loading}
              />
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="imageUrl">Product Image URL (optional)</label>
              <input
                id="imageUrl"
                className="form-input"
                name="imageUrl"
                type="url"
                defaultValue={product.imageUrl || ''}
                disabled={loading}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: '2rem',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem',
              borderTop: '1px solid var(--border-primary)',
              paddingTop: '1.5rem',
            }}
          >
            <Link href={`/products/${product.id}`} className={`btn btn-ghost ${loading ? 'pointer-events-none opacity-50' : ''}`}>
              Cancel
            </Link>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
