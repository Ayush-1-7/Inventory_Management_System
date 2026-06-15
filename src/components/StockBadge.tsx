'use client';

interface StockBadgeProps {
  stock: number;
  reorderAt: number;
}

export default function StockBadge({ stock, reorderAt }: StockBadgeProps) {
  let badgeClass = 'badge-success';
  let label = 'In Stock';

  if (stock <= 0) {
    badgeClass = 'badge-danger';
    label = 'Out of Stock';
  } else if (stock <= reorderAt) {
    badgeClass = 'badge-warning';
    label = 'Low Stock';
  }

  return (
    <span className={`badge ${badgeClass}`} style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'currentColor',
        }}
      />
      {label} ({stock})
    </span>
  );
}
