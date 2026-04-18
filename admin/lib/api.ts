import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './auth';

const base = () => process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

type Opts = RequestInit & { skipAuth?: boolean };

export async function api<T>(path: string, init: Opts = {}): Promise<T> {
  const { skipAuth, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (rest.body && !(rest.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (!skipAuth) {
    const t = getAccessToken();
    if (t) headers.set('Authorization', `Bearer ${t}`);
  }

  let res = await fetch(`${base()}${path}`, { ...rest, headers });

  if (res.status === 401 && !skipAuth) {
    const rt = getRefreshToken();
    if (rt) {
      const r2 = await fetch(`${base()}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt }),
      });
      if (r2.ok) {
        const j = (await r2.json()) as { accessToken: string; refreshToken: string };
        setTokens(j.accessToken, j.refreshToken);
        headers.set('Authorization', `Bearer ${j.accessToken}`);
        res = await fetch(`${base()}${path}`, { ...rest, headers });
      } else {
        clearTokens();
      }
    }
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
