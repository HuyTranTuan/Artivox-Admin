import { useState } from "react";
import { Bell, PanelLeftClose, Search, X } from "lucide-react";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { useUiStore } from "@store/uiStore";
import { useAuth } from "@hooks/useAuth";
import { useDebounce } from "@hooks/useDebounce";

export const Header = () => {
  const { toggleSidebar } = useUiStore();
  const { user, handleSignOut } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
    if (searchOpen) {
      setSearchValue("");
    }
  };

  return (
    <header className="flex flex-col gap-4 border-b border-slate-200/70 bg-white/70 px-6 py-5 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          className="h-14 w-14 rounded-2xl p-0"
          onClick={toggleSidebar}
        >
          <PanelLeftClose className="h-6 w-6" />
        </Button>
        <div>
          <div className="font-title text-xl font-bold text-slate-950">
            Campaign Control
          </div>
          <div className="text-sm text-slate-500">
            Manage content, products, and orders
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {searchOpen ? (
          <div className="relative w-72">
            <Input
              className="pl-4"
              placeholder="Search campaigns, orders, products..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              autoFocus
            />
            {debouncedSearch && (
              <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-lg z-10 p-3">
                <div className="text-sm text-slate-600">
                  Search suggestions for:{" "}
                  <span className="font-semibold">{debouncedSearch}</span>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              onClick={handleSearchToggle}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="h-11 w-11 rounded-2xl p-0"
            onClick={handleSearchToggle}
          >
            <Search className="h-5 w-5" />
          </Button>
        )}
        <Button variant="ghost" className="h-11 w-11 rounded-2xl p-0">
          <Bell className="h-6 w-6" />
        </Button>
        <div className="flex flex-col items-center gap-2">
          <div className="h-12 w-12 rounded-full bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="text-center">
            <div className="font-title text-xs font-semibold text-slate-900">
              {user?.name || "Guest"}
            </div>
            <div className="text-xs text-slate-500">
              {user?.role || "No role"}
            </div>
          </div>
        </div>
        <Button variant="secondary" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </header>
  );
};
