'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Row = {
  id: string;
  name: string;
  slug: string;
  status: string;
  variants: { sku: string; inventory: { quantityOnHand: number } | null }[];
};

export default function ProductsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api<{ items: Row[] }>('/admin/catalog/products?pageSize=50')
      .then((r) => setRows(r.items))
      .catch((e) => setErr(e instanceof Error ? e.message : 'Failed'));
  }, []);

  if (err) return <p className="text-red-600">{err}</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Products</h1>
      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">SKU / Stock</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-slate-100">
                <td className="px-4 py-3">
                  <Link href={`/products/${p.id}`} className="text-accent hover:underline">
                    {p.name}
                  </Link>
                  <div className="text-xs text-slate-500">{p.slug}</div>
                </td>
                <td className="px-4 py-3">{p.status}</td>
                <td className="px-4 py-3 text-slate-600">
                  {p.variants.map((v) => (
                    <div key={v.sku}>
                      {v.sku}: {v.inventory?.quantityOnHand ?? '—'}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
