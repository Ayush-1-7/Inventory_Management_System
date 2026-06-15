import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import ToastProvider from '@/components/ToastProvider';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'InvenTrack — Inventory Management',
  description: 'Premium full-stack inventory management system with real-time stock tracking, analytics, and CSV import/export.',
  keywords: 'inventory, management, stock, tracking, dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
        <ToastProvider />
      </body>
    </html>
  );
}
