'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Summary = {
  ordersLast30Days: number;
  revenueLast30Days: string;
  customerCount: number;
  activeProducts: number;
  pendingReviews: number;
  lowStockVariants: number;
};

export default function DashboardPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api<Summary>('/admin/analytics/summary')
      .then(setData)
      .catch((e) => setErr(e instanceof Error ? e.message : 'Failed to load'));
  }, []);

  if (err) {
    return <p className="text-red-600">{err}</p>;
  }
  if (!data) {
    return <p className="text-slate-500">Loading analytics…</p>;
  }

  const cards = [
    { label: 'Orders (30d)', value: data.ordersLast30Days },
    { label: 'Revenue (30d)', value: `$${data.revenueLast30Days}` },
    { label: 'Customers', value: data.customerCount },
    { label: 'Active products', value: data.activeProducts },
    { label: 'Pending reviews', value: data.pendingReviews },
    { label: 'Low stock variants', value: data.lowStockVariants },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-slate-500">Operational snapshot</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="text-sm text-slate-500">{c.label}</div>
            <div className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
