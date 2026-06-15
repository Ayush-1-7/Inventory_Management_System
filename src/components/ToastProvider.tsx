'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: '#1e293b',
          color: '#f1f5f9',
          border: '1px solid rgba(148, 163, 184, 0.12)',
          borderRadius: '0.75rem',
          fontSize: '0.875rem',
          fontFamily: 'Inter, sans-serif',
          padding: '12px 16px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
        },
        success: {
          iconTheme: { primary: '#10b981', secondary: '#f1f5f9' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' },
        },
      }}
    />
  );
}
