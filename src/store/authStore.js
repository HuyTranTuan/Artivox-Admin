import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: "",
      refreshToken: "",
      signIn: (payload) => {
        const data = {
          user: payload.user,
          token: payload.token,
          refreshToken: payload.refreshToken || "",
        };
        set(data);
      },
      refreshAuth: (payload) => {
        set((state) => ({
          ...state,
          token: payload.token,
          refreshToken: payload.refreshToken || "",
        }));
      },
      signOut: () => {
        set({ user: null, token: "", refreshToken: "" });
      },
    }),
    {
      name: "artivox-admin-auth",
      getStorage: () => sessionStorage,
    },
  ),
);
