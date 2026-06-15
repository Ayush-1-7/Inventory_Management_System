'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: 'accent' | 'success' | 'warning' | 'info';
}

export default function StatCard({ title, value, icon, variant = 'accent' }: StatCardProps) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className={`stat-icon ${variant}`}>
        {icon}
      </div>
      <div className="stat-label">{title}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
