'use client';

import { Search, X } from 'lucide-react';
import { useTransition } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = 'Search...' }: SearchBarProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="search-container" style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
      <Search
        size={18}
        className="text-secondary"
        style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          opacity: 0.6,
        }}
      />
      <input
        type="text"
        className="form-input"
        value={value}
        onChange={(e) => startTransition(() => onChange(e.target.value))}
        placeholder={placeholder}
        style={{
          paddingLeft: '38px',
          paddingRight: value ? '34px' : '12px',
          width: '100%',
          margin: 0,
        }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
