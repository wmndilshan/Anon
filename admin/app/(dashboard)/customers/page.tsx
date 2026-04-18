'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Row = { id: string; email: string; firstName: string | null; lastName: string | null; status: string };

export default function CustomersPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api<{ items: Row[] }>('/admin/customers?pageSize=50')
      .then((r) => setItems(r.items))
      .catch((e) => setErr(e instanceof Error ? e.message : 'Failed'));
  }, []);

  if (err) return <p className="text-red-600">{err}</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Customers</h1>
      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-b border-slate-100">
                <td className="px-4 py-3">
                  <Link href={`/customers/${c.id}`} className="text-accent hover:underline">
                    {c.email}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {[c.firstName, c.lastName].filter(Boolean).join(' ') || '—'}
                </td>
                <td className="px-4 py-3">{c.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
