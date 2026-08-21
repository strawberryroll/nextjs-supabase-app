"use client";

import { useCallback, useSyncExternalStore } from "react";

const CART_STORAGE_KEY = "commerce-cart";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

const listeners = new Set<() => void>();

function readCartFromStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

// useSyncExternalStore의 getSnapshot은 참조 동일성으로 변경 여부를 판단하므로,
// localStorage를 매번 다시 읽지 않고 쓰기 시점에만 갱신되는 캐시를 반환한다.
let cachedItems: CartItem[] = [];

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): CartItem[] {
  return cachedItems;
}

function getServerSnapshot(): CartItem[] {
  return cachedItems;
}

function writeCartToStorage(items: CartItem[]) {
  cachedItems = items;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  cachedItems = readCartFromStorage();
}

export function useCart() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity: number = 1) => {
      const current = cachedItems;
      const existing = current.find((i) => i.productId === item.productId);
      const next = existing
        ? current.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          )
        : [...current, { ...item, quantity }];
      writeCartToStorage(next);
    },
    [],
  );

  const removeItem = useCallback((productId: string) => {
    writeCartToStorage(cachedItems.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      writeCartToStorage(cachedItems.filter((i) => i.productId !== productId));
      return;
    }
    writeCartToStorage(
      cachedItems.map((i) =>
        i.productId === productId ? { ...i, quantity } : i,
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    writeCartToStorage([]);
  }, []);

  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalPrice,
  };
}
