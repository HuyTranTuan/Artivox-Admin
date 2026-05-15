import { create } from "zustand";
import { persist } from "zustand/middleware";

export const usewishlistsStore = create(
  persist(
    (set) => ({
      wishlists: [],
      addToList: (product) => set((state) => ({ wishlists: [...state, product] })),
      clearList: () => set({ wishlists: {} }),
    }),
    {
      name: "artivox-wishlists",
      getStorage: () => sessionStorage,
    },
  ),
);
