import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set) => ({
      products: [],
      addQuantity: (product) => set((state) => ({ products: [...state, { ...product, quantity: product.quantity + 1 }] })),
      minusQuantity: (product) => set((state) => ({ products: [...state, { ...product, quantity: product.quantity - 1 }] })),
      addToCart: (product) => set((state) => ({ products: [...state, product] })),
      removeToCart: (product) => set((state) => ({ products: state.product.filter(product) })),
      clearCart: () => set({ products: {} }),
    }),
    {
      name: "artivox-cart",
      getStorage: () => sessionStorage,
    },
  ),
);
