import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "@layouts/DashoardLayout/components/Header";
import { Sidebar } from "@layouts/DashoardLayout/components/Sidebar";
import { useUiStore } from "@store/uiStore";

const DashboardLayout = () => {
  const { sidebarMobileOpen, closeMobileSidebar, setSidebarOpen } = useUiStore();

  // Auto-collapse sidebar on resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [setSidebarOpen]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {sidebarMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={closeMobileSidebar} />
          <div className="relative z-50 h-full w-72">
            <Sidebar forcedOpen />
          </div>
        </div>
      )}

      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <Header />
        <main className="scrollbar-soft flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
