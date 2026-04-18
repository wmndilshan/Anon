import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ImageSourcePropType } from "react-native";
import { MOCK_PRODUCTS } from "../data/mockProducts";

const STORAGE_KEY = "@anon_cart";

export type CartLine = {
  productId: string;
  title: string;
  price: number;
  qty: number;
  image: ImageSourcePropType;
};

type CartContextValue = {
  lines: CartLine[];
  addToCart: (productId: string, qty?: number) => void;
  removeLine: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  itemCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function lineFromProduct(p: (typeof MOCK_PRODUCTS)[0], qty: number): CartLine {
  return {
    productId: p.id,
    title: p.title,
    price: p.price,
    qty,
    image: p.image,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { productId: string; qty: number }[];
          const rebuilt: CartLine[] = [];
          for (const row of parsed) {
            const p = MOCK_PRODUCTS.find((x) => x.id === row.productId);
            if (p) rebuilt.push(lineFromProduct(p, row.qty));
          }
          setLines(rebuilt);
        }
      } catch {
        /* ignore */
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const slim = lines.map((l) => ({ productId: l.productId, qty: l.qty }));
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
      } catch {
        /* ignore */
      }
    })();
  }, [lines, hydrated]);

  const addToCart = useCallback((productId: string, qty = 1) => {
    const p = MOCK_PRODUCTS.find((x) => x.id === productId);
    if (!p) return;
    setLines((prev) => {
      const i = prev.findIndex((l) => l.productId === productId);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + qty };
        return next;
      }
      return [...prev, lineFromProduct(p, qty)];
    });
  }, []);

  const removeLine = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    if (qty < 1) {
      setLines((prev) => prev.filter((l) => l.productId !== productId));
      return;
    }
    setLines((prev) => prev.map((l) => (l.productId === productId ? { ...l, qty } : l)));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const itemCount = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.price * l.qty, 0), [lines]);

  const value = useMemo(
    () => ({ lines, addToCart, removeLine, setQty, clear, itemCount, subtotal }),
    [lines, addToCart, removeLine, setQty, clear, itemCount, subtotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
