'use client';

import { useParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [err, setErr] = useState('');
  const [status, setStatus] = useState('');
  const [tracking, setTracking] = useState('');

  const load = () =>
    api<Record<string, unknown>>(`/admin/orders/${id}`)
      .then((o) => {
        setOrder(o);
        setStatus(String(o.status ?? ''));
      })
      .catch((e) => setErr(e instanceof Error ? e.message : 'Failed'));

  useEffect(() => {
    load();
  }, [id]);

  async function save(e: FormEvent) {
    e.preventDefault();
    await api(`/admin/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, trackingNumber: tracking || undefined }),
    });
    setTracking('');
    await load();
  }

  if (err) return <p className="text-red-600">{err}</p>;
  if (!order) return <p className="text-slate-500">Loading…</p>;

  const items = (order.items as Record<string, unknown>[]) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Order {String(order.orderNumber)}</h1>
      <p className="text-slate-500">Total {String(order.grandTotal)}</p>

      <form onSubmit={save} className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <label className="block text-xs font-medium text-slate-600">Status</label>
          <input
            className="mt-1 rounded border px-2 py-1 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Tracking</label>
          <input
            className="mt-1 rounded border px-2 py-1 text-sm"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="Optional"
          />
        </div>
        <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-sm text-white">
          Save
        </button>
      </form>

      <h2 className="mt-8 text-lg font-medium">Line items</h2>
      <ul className="mt-2 space-y-2">
        {items.map((it) => (
          <li key={String(it.id)} className="rounded border border-slate-100 bg-white px-4 py-2 text-sm">
            {String(it.nameSnapshot)} × {String(it.quantity)} @ {String(it.unitPrice)}
          </li>
        ))}
      </ul>
    </div>
  );
}
