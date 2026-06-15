'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewProductPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create product');
      }

      toast.success(`Product ${payload.name} created successfully!`);
      router.push('/products');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Add Product</h1>
          <p className="page-subtitle">Add a new item to your stock catalog</p>
        </div>
        <div className="page-actions">
          <Link href="/products" className="btn btn-ghost">
            <ArrowLeft size={16} />
            Back to Products
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
                placeholder="e.g. Wireless Mouse"
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
                placeholder="e.g. MS-WRL-001"
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
                placeholder="Describe your product specs, features, or storage requirements..."
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
                placeholder="e.g. Electronics"
                disabled={loading}
              />
            </div>
            <div className="col-6">
              <label className="form-label" htmlFor="unit">Unit of Measure</label>
              <input
                id="unit"
                className="form-input"
                name="unit"
                placeholder="e.g. pcs, boxes, kgs"
                defaultValue="pcs"
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
                placeholder="0.00"
                defaultValue="0.00"
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
                placeholder="0"
                defaultValue="10"
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
                placeholder="https://example.com/image.png"
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
            <Link href="/products" className={`btn btn-ghost ${loading ? 'pointer-events-none opacity-50' : ''}`}>
              Cancel
            </Link>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              <Save size={16} />
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
