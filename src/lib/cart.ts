// src/lib/cart.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
  selectedSize?: string;
  selectedColor?: string;
  embroideryType?: string;
  customText?: string;
  embroideryColor?: string;
  designDescription?: string;
  gender?: string;
  stock?: number;
};

interface CartState {
  items: CartItem[];
  
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  updateItem: (id: number, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) =>
        set((state) => {
          // Verifica se já existe item igual (mesmo ID)
          const existingIndex = state.items.findIndex((item) => item.id === newItem.id);

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex].quantity += newItem.quantity;
            return { items: updatedItems };
          }

          return { items: [...state.items, newItem] };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => {
           if (quantity <= 0) {
               return { items: state.items.filter((item) => item.id !== id) };
           }
           return {
              items: state.items.map((item) =>
                item.id === id ? { ...item, quantity } : item
              ),
           };
        }),

      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),

      clearCart: () => set({ items: [] }),

      getTotalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),

      getTotalPrice: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    }),
    {
      name: "artecomcarinho-cart",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);