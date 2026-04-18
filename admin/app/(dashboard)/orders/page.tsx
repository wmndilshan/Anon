'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  grandTotal: string;
  createdAt: string;
  user?: { email: string };
};

export default function OrdersPage() {
  const [items, setItems] = useState<Order[]>([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api<{ items: Order[] }>('/admin/orders?pageSize=50')
      .then((r) => setItems(r.items))
      .catch((e) => setErr(e instanceof Error ? e.message : 'Failed'));
  }, []);

  if (err) return <p className="text-red-600">{err}</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Orders</h1>
      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id} className="border-b border-slate-100">
                <td className="px-4 py-3">
                  <Link href={`/orders/${o.id}`} className="text-accent hover:underline">
                    {o.orderNumber}
                  </Link>
                  <div className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleString()}</div>
                </td>
                <td className="px-4 py-3">{o.user?.email ?? '—'}</td>
                <td className="px-4 py-3">{o.status}</td>
                <td className="px-4 py-3 tabular-nums">{o.grandTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
