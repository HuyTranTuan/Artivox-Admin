import { Bell, PanelLeftClose, Search } from "lucide-react";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { useUiStore } from "@store/uiStore";
import { useAuth } from "@hooks/useAuth";

export const Header = () => {
  const { toggleSidebar } = useUiStore();
  const { user, handleSignOut } = useAuth();

  return (
    <header className="flex flex-col gap-4 border-b border-slate-200/70 bg-white/70 px-6 py-5 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <Button variant="ghost" className="h-11 w-11 rounded-2xl p-0" onClick={toggleSidebar}>
          <PanelLeftClose className="h-5 w-5" />
        </Button>
        <div>
          <div className="font-title text-xl font-bold text-slate-950">Campaign Control</div>
          <div className="text-sm text-slate-500">Manage content, products, and orders</div>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-72">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input className="pl-10" placeholder="Search campaigns, orders, products..." />
        </div>
        <Button variant="ghost" className="h-11 w-11 rounded-2xl p-0">
          <Bell className="h-5 w-5" />
        </Button>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2">
          <div className="font-title text-sm font-semibold text-slate-900">{user?.name || "Guest"}</div>
          <div className="text-xs text-slate-500">{user?.role || "No role"}</div>
        </div>
        <Button variant="secondary" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </header>
  );
};
