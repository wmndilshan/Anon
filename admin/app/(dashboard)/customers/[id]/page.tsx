'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api<Record<string, unknown>>(`/admin/customers/${id}`)
      .then(setData)
      .catch((e) => setErr(e instanceof Error ? e.message : 'Failed'));
  }, [id]);

  if (err) return <p className="text-red-600">{err}</p>;
  if (!data) return <p className="text-slate-500">Loading…</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold">{String(data.email)}</h1>
      <p className="text-slate-500">
        {[data.firstName, data.lastName].filter(Boolean).join(' ') || 'No name'}
      </p>
      <p className="mt-2 text-sm">Status: {String(data.status)}</p>
    </div>
  );
}
