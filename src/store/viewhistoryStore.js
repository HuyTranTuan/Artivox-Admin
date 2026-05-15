import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useViewHistoryStore = create(
  persist(
    (set) => ({
      viewHistory: [],
      addToList: (product) => set((state) => ({ viewHistory: [...state, product] })),
      clearList: () => set({ viewHistory: {} }),
    }),
    {
      name: "artivox-view-history",
      getStorage: () => sessionStorage,
    },
  ),
);
