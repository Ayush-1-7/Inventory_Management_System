'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ArrowUpDown,
  Menu,
  X,
  Boxes,
} from 'lucide-react';

const navItems = [
  {
    section: 'Overview',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    section: 'Inventory',
    items: [
      { href: '/products', label: 'Products', icon: Package },
      { href: '/movements', label: 'Stock Movements', icon: ArrowUpDown },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile header */}
      <div className="mobile-header">
        <div className="flex items-center gap-3">
          <div className="sidebar-brand-icon">
            <Boxes size={20} />
          </div>
          <span className="font-bold">InvenTrack</span>
        </div>
        <button
          className="mobile-menu-btn"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Overlay */}
      <div
        className={`sidebar-overlay ${open ? 'open' : ''}`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Boxes size={20} />
          </div>
          <div>
            <div className="sidebar-brand-text">InvenTrack</div>
            <div className="sidebar-brand-sub">Inventory Manager</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((section) => (
            <div key={section.section}>
              <div className="sidebar-section-title">{section.section}</div>
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="text-xs text-muted" style={{ textAlign: 'center' }}>
            InvenTrack v1.0
          </div>
        </div>
      </aside>
    </>
  );
}
