import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUiStore = create(
  persist(
    (set) => ({
      sidebarOpen: true,
      sidebarMobileOpen: false,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleMobileSidebar: () => set((state) => ({ sidebarMobileOpen: !state.sidebarMobileOpen })),
      closeMobileSidebar: () => set({ sidebarMobileOpen: false }),
    }),
    {
      name: "artivox-ui-storage",
      getStorage: () => sessionStorage,
    }
  )
);
