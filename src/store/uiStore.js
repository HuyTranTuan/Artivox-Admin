import { create } from "zustand";
import { persist } from "zustand/middleware";

// Initialize theme from localStorage or browser preference
const initializeTheme = () => {
  // Check localStorage first
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  // Check browser preference
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  // Default to light
  return "light";
};

export const useUiStore = create(
  persist(
    (set) => ({
      sidebarOpen: true,
      sidebarMobileOpen: false,
      currentLanguage: "en",
      theme: initializeTheme(),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleMobileSidebar: () => set((state) => ({ sidebarMobileOpen: !state.sidebarMobileOpen })),
      closeMobileSidebar: () => set({ sidebarMobileOpen: false }),
      setTheme: (newTheme) => {
        if (typeof newTheme === "string" && (newTheme === "light" || newTheme === "dark")) {
          set({ theme: newTheme });
          localStorage.setItem("theme", newTheme);
          document.documentElement.classList.toggle("dark", newTheme === "dark");
        }
      },
      setCurrentLanguage: (lang) => {
        if (typeof lang === "string" && (lang === "en" || lang === "vi")) {
          set({ currentLanguage: lang });
        }
      },
    }),
    {
      name: "artivox-ui",
      getStorage: () => sessionStorage,
    },
  ),
);
