// src/lib/cart.ts

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
};

const STORAGE_KEY = "artecomcarinho_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getCartCount(): number {
  const items = getCart();
  return items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
}

// helper para futuro
export function addToCart(item: CartItem) {
  const items = getCart();
  const existing = items.find((i) => i.productId === item.productId);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    items.push(item);
  }
  saveCart(items);
}
