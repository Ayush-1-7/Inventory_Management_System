'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, PlusCircle, MinusCircle, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  sku: string;
  unit: string;
  price: number;
}

export default function AdjustStockPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [direction, setDirection] = useState<'IN' | 'OUT' | 'ADJUSTMENT'>('IN');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (quantity <= 0) {
      toast.error('Quantity must be greater than zero');
      return;
    }

    setLoading(true);

    // Calculate signed quantity
    // IN = +qty, OUT = -qty, ADJUSTMENT = signed value input or custom
    let finalQty = quantity;
    if (direction === 'OUT') {
      finalQty = -quantity;
    }

    try {
      const res = await fetch(`/api/products/${product.id}/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: finalQty,
          type: direction,
          reason: reason.trim(),
          reference: reference.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to adjust stock');
      }

      toast.success('Stock adjusted successfully!');
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
        <div className="animate-spin" style={{ width: '30px', height: '30px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} />
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
          <h1 className="page-title">Adjust Stock</h1>
          <p className="page-subtitle">
            Update quantity for <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{product.name}</span> ({product.sku})
          </p>
        </div>
        <div className="page-actions">
          <Link href={`/products/${product.id}`} className="btn btn-ghost">
            <ArrowLeft size={16} />
            Back to Details
          </Link>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          {/* Movement Type Buttons */}
          <div style={{ marginBottom: '2rem' }}>
            <label className="form-label" style={{ marginBottom: '0.75rem' }}>Movement Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                className={`btn ${direction === 'IN' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setDirection('IN')}
                style={{ justifyContent: 'center', gap: '0.5rem', height: '48px' }}
              >
                <PlusCircle size={18} />
                Stock In (Add)
              </button>
              <button
                type="button"
                className={`btn ${direction === 'OUT' ? 'btn-danger' : 'btn-ghost'}`}
                onClick={() => setDirection('OUT')}
                style={{ justifyContent: 'center', gap: '0.5rem', height: '48px' }}
              >
                <MinusCircle size={18} />
                Stock Out (Remove)
              </button>
            </div>
          </div>

          <div className="grid">
            {/* Quantity */}
            <div className="col-12">
              <label className="form-label" htmlFor="quantity">
                Quantity ({product.unit}) *
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                required
                className="form-input"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 0))}
                disabled={loading}
              />
            </div>

            {/* Reason */}
            <div className="col-12">
              <label className="form-label" htmlFor="reason">Reason / Description *</label>
              <select
                id="reason-select"
                className="form-input"
                style={{ marginBottom: '0.75rem' }}
                onChange={(e) => setReason(e.target.value)}
                value={reason}
                disabled={loading}
              >
                <option value="">-- Select a reason or enter custom below --</option>
                {direction === 'IN' ? (
                  <>
                    <option value="Restock / Purchase Order">Restock / Purchase Order</option>
                    <option value="Customer Return">Customer Return</option>
                    <option value="Inventory Audit Adjustment">Inventory Audit Adjustment</option>
                    <option value="Initial Stock In">Initial Stock In</option>
                  </>
                ) : (
                  <>
                    <option value="Sale / Shipment">Sale / Shipment</option>
                    <option value="Damaged / Wasted Goods">Damaged / Wasted Goods</option>
                    <option value="Inventory Audit Adjustment">Inventory Audit Adjustment</option>
                    <option value="Internal Use">Internal Use</option>
                  </>
                )}
              </select>
              <input
                id="reason"
                className="form-input"
                placeholder="Or type custom reason here..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Reference */}
            <div className="col-12">
              <label className="form-label" htmlFor="reference">Reference (optional)</label>
              <input
                id="reference"
                className="form-input"
                placeholder="e.g. PO-84930, Invoice #92, Audit-2026"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
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
            <button
              className={`btn ${direction === 'IN' ? 'btn-primary' : 'btn-danger'}`}
              type="submit"
              disabled={loading}
            >
              <Save size={16} />
              {loading ? 'Submitting...' : 'Apply Stock Change'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
