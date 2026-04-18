import { USE_MOCK_API } from "../config/env";
import { MOCK_PRODUCTS, type Product } from "../data/mockProducts";
import { apiGet } from "./client";

export async function fetchProducts(params?: { category?: string; q?: string }): Promise<Product[]> {
  if (USE_MOCK_API) {
    let list = [...MOCK_PRODUCTS];
    if (params?.category) {
      const c = params.category.toLowerCase();
      list = list.filter(
        (p) =>
          p.categorySlug === c ||
          p.categorySlug.includes(c) ||
          p.category.toLowerCase().includes(c),
      );
    }
    if (params?.q && params.q.trim().length > 0) {
      const q = params.q.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q));
    }
    return Promise.resolve(list);
  }
  const q = new URLSearchParams();
  if (params?.category) q.set("category", params.category);
  if (params?.q) q.set("q", params.q);
  return apiGet<Product[]>(`/products?${q.toString()}`);
}

export async function fetchProductById(id: string): Promise<Product | null> {
  if (USE_MOCK_API) {
    return Promise.resolve(MOCK_PRODUCTS.find((p) => p.id === id) ?? null);
  }
  return apiGet<Product | null>(`/products/${id}`);
}
