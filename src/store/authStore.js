import { create } from "zustand";
import { persist } from "zustand/middleware";

let storedState = null;
try {
  storedState = JSON.parse(sessionStorage.getItem("artivox-auth"))?.state;
} catch (e) {}

export const useAuthStore = create(
  persist(
    (set) => ({
      user: storedState?.user || null,
      accessToken: storedState?.accessToken || "",
      refreshToken: storedState?.refreshToken || "",
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
      refreshUserAvatar: (avatar) =>
        set((state) => ({
          ...state,
          user: state.user
            ? {
                ...state.user,
                avatar,
              }
            : null,
        })),
      updateUser: (userData) =>
        set((state) => ({
          ...state,
          user: state.user
            ? {
                ...state.user,
                ...userData,
              }
            : null,
        })),
    }),
    {
      name: "artivox-auth",
      getStorage: () => sessionStorage,
    },
  ),
);
