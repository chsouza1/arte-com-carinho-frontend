// src/lib/cart.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  selectedSize?: string;
  selectedColor?: string;
};

interface CartState {
  items: CartItem[];
  
  // Ações
  addItem: (item: CartItem) => void;
  removeItem: (id: number, size?: string, color?: string) => void;
  updateQuantity: (id: number, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  
  // Getters computados
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) =>
        set((state) => {
          // Verifica se já existe o mesmo produto com as mesmas opções (cor/tamanho)
          const existingIndex = state.items.findIndex(
            (item) =>
              item.id === newItem.id &&
              item.selectedSize === newItem.selectedSize &&
              item.selectedColor === newItem.selectedColor
          );

          if (existingIndex > -1) {
            // Se existe, só aumenta a quantidade
            const updatedItems = [...state.items];
            updatedItems[existingIndex].quantity += newItem.quantity;
            return { items: updatedItems };
          }

          // Se não, adiciona novo item
          return { items: [...state.items, newItem] };
        }),

      removeItem: (id, size, color) =>
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.id === id &&
                item.selectedSize === size &&
                item.selectedColor === color
              )
          ),
        })),

      updateQuantity: (id, quantity, size, color) =>
        set((state) => {
          if (quantity <= 0) {
            // Se quantidade for 0 ou menos, remove o item
            return {
                items: state.items.filter(
                    (item) => !(item.id === id && item.selectedSize === size && item.selectedColor === color)
                )
            }
          }  
          return {
            items: state.items.map((item) => {
              if (
                item.id === id &&
                item.selectedSize === size &&
                item.selectedColor === color
              ) {
                return { ...item, quantity };
              }
              return item;
            }),
          };
        }),

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      },
    }),
    {
      name: "artecomcarinho-cart",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true, 
    }
  )
);