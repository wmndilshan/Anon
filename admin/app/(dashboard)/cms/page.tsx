'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Banner = { id: string; placement: string; title: string | null; imageUrl: string; isActive: boolean };

export default function CmsPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api<Banner[]>('/admin/cms/banners')
      .then(setBanners)
      .catch((e) => setErr(e instanceof Error ? e.message : 'Failed'));
  }, []);

  if (err) return <p className="text-red-600">{err}</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold">CMS — Banners</h1>
      <p className="mt-1 text-slate-500">Hero, promo, and announcement placements</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {banners.map((b) => (
          <div key={b.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.imageUrl} alt="" className="h-40 w-full object-cover" />
            <div className="p-4">
              <div className="text-xs uppercase text-slate-500">{b.placement}</div>
              <div className="font-medium">{b.title ?? '—'}</div>
              <div className="mt-1 text-sm text-slate-600">{b.isActive ? 'Active' : 'Inactive'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
