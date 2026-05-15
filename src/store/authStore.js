import { readStorage } from "@/utils/localStorage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const user = readStorage("artivox-auth").state;

export const useAuthStore = create(
  persist(
    (set) => ({
      user: user?.user || null,
      accessToken: user?.accessToken || "",
      refreshToken: user?.refreshToken || "",
      signIn: (payload) => {
        const data = {
          user: payload?.user || null,
          accessToken: payload?.accessToken || "",
          refreshToken: payload?.refreshToken || "",
        };
        set(data);
      },
      refreshAuth: (payload) => {
        set((state) => ({
          ...state,
          accessToken: payload?.accessToken || "",
          refreshToken: payload?.refreshToken || "",
        }));
      },
      signOut: () => {
        set({ user: null, accessToken: "", refreshToken: "" });
      },
    }),
    {
      name: "artivox-auth",
      getStorage: () => sessionStorage,
    },
  ),
);
