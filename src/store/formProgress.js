import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useFormProgressStore = create(
  persist(
    (set) => ({
      loginForm: {},
      creatArticleForm: {},
      creatProductForm: {},
      clearLoginForm: () => set({ loginForm: {} }),
      clearArticleForm: () => set({ creatArticleForm: {} }),
      clearProductForm: () => set({ creatProductForm: {} }),
    }),
    {
      name: "artivox-forms",
      getStorage: () => sessionStorage,
    },
  ),
);
