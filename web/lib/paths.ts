/** Base URL for static assets under /public (legacy used ./assets/...) */
export const A = (path: string) => `/assets${path.startsWith("/") ? path : `/${path}`}`;
