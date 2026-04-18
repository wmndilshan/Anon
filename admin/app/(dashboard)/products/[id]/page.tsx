'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [err, setErr] = useState('');
  const [qty, setQty] = useState<Record<string, string>>({});

  useEffect(() => {
    api<Record<string, unknown>>(`/admin/catalog/products/${id}`)
      .then(setData)
      .catch((e) => setErr(e instanceof Error ? e.message : 'Failed'));
  }, [id]);

  async function saveStock(variantId: string) {
    const q = qty[variantId];
    if (q === undefined) return;
    await api(`/admin/catalog/products/variants/${variantId}/inventory`, {
      method: 'POST',
      body: JSON.stringify({ quantityOnHand: parseInt(q, 10) }),
    });
    const fresh = await api<Record<string, unknown>>(`/admin/catalog/products/${id}`);
    setData(fresh);
  }

  if (err) return <p className="text-red-600">{err}</p>;
  if (!data) return <p className="text-slate-500">Loading…</p>;

  const variants = (data.variants as { id: string; sku: string; inventory: { quantityOnHand: number } | null }[]) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-semibold">{String(data.name)}</h1>
      <p className="text-slate-500">{String(data.slug)}</p>
      <h2 className="mt-8 text-lg font-medium">Variants & inventory</h2>
      <ul className="mt-4 space-y-4">
        {variants.map((v) => (
          <li key={v.id} className="flex flex-wrap items-end gap-3 rounded border border-slate-200 bg-white p-4">
            <div>
              <div className="font-mono text-sm">{v.sku}</div>
              <div className="text-xs text-slate-500">On hand: {v.inventory?.quantityOnHand ?? 0}</div>
            </div>
            <div className="flex items-center gap-2">
              <input
                className="w-24 rounded border px-2 py-1 text-sm"
                placeholder="New qty"
                value={qty[v.id] ?? ''}
                onChange={(e) => setQty((s) => ({ ...s, [v.id]: e.target.value }))}
              />
              <button
                type="button"
                onClick={() => saveStock(v.id)}
                className="rounded bg-slate-900 px-3 py-1 text-sm text-white"
              >
                Update
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
