import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUiStore = create(
  persist(
    (set) => ({
      sidebarOpen: true,
      sidebarMobileOpen: false,
      currentLanguage: "en",
      theme: "light",
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleMobileSidebar: () =>
        set((state) => ({ sidebarMobileOpen: !state.sidebarMobileOpen })),
      closeMobileSidebar: () => set({ sidebarMobileOpen: false }),
      setTheme: (state) => {
        if (state.theme === "light") set({ theme: "dark" });
        else set({ theme: "light" });
      },
    }),
    {
      name: "artivox-ui-storage",
      getStorage: () => sessionStorage,
    },
  ),
);
