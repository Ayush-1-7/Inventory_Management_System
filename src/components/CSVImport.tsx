'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Upload, FileSpreadsheet, X } from 'lucide-react';

export default function CSVImport() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Import failed');

      toast.success(`Imported ${data.imported} products`);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {file ? (
        <div className="flex items-center gap-2">
          <span className="badge badge-info">
            <FileSpreadsheet size={12} />
            {file.name}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setFile(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
          >
            <X size={14} />
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Importing...' : 'Import'}
          </button>
        </div>
      ) : (
        <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
          <Upload size={14} />
          Import CSV
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
      )}
    </div>
  );
}
