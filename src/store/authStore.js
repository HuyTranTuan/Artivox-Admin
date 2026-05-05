import { create } from "zustand";

const STORAGE_KEY = "artivox-admin-auth";

const readStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch (error) {
    return null;
  }
};

const writeStorage = (value) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
};

export const useAuthStore = create((set) => {
  const persisted = typeof window !== "undefined" ? readStorage() : null;

  return {
    user: persisted?.user || null,
    token: persisted?.token || "",
    signIn: (payload) => {
      writeStorage(payload);
      set({
        user: payload.user,
        token: payload.token
      });
    },
    signOut: () => {
      localStorage.removeItem(STORAGE_KEY);
      set({
        user: null,
        token: ""
      });
    }
  };
});
