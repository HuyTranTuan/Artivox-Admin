import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, LogOut, Menu, Search, Settings2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { useAuth } from "@hooks/useAuth";
import { useExpandableSearch } from "@hooks/useExpandableSearch";
import { useUiStore } from "@store/uiStore";

const initialNotifications = [
  {
    id: 1,
    title: "New refund request",
    description: "Order #AVX-201 needs approval.",
    read: false,
  },
  {
    id: 2,
    title: "Low stock alert",
    description: "Resin Material 08 is below threshold.",
    read: false,
  },
  {
    id: 3,
    title: "Campaign published",
    description: "Summer Launch article is now live.",
    read: true,
  },
];

export const Header = () => {
  const { toggleSidebar, toggleMobileSidebar } = useUiStore();
  const { user, handleSignOut } = useAuth();
  const navigate = useNavigate();
  const search = useExpandableSearch();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const menuRef = useRef(null);
  const notificationRef = useRef(null);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  const visibleNotifications = useMemo(() => {
    if (showUnreadOnly) {
      return notifications.filter((item) => !item.read);
    }
    return notifications;
  }, [notifications, showUnreadOnly]);

  const handleToggle = () => {
    if (window.innerWidth < 1024) {
      toggleMobileSidebar();
    } else {
      toggleSidebar();
    }
  };

  useEffect(() => {
    const handler = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleNotifications = () => {
    setNotificationOpen((prev) => !prev);
  };

  return (
    <header className="sticky top-0 z-30 flex flex-col gap-4 border-b border-slate-200/70 bg-white/70 px-6 py-5 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <Button variant="ghost" className="h-14 w-14 rounded-2xl p-0" onClick={handleToggle}>
          <Menu style={{ width: 22, height: 22 }} />
        </Button>
        <div>
          <div className="font-title text-xl font-bold text-slate-950">Campaign Control</div>
          <div className="text-sm text-slate-500">Manage content, products, and orders</div>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div ref={search.containerRef} className="flex items-center gap-2">
          {search.isOpen ? (
            <div className="relative w-80">
              <Input
                ref={search.inputRef}
                className="pl-4 pr-10"
                placeholder="Search campaigns, orders, products..."
                value={search.value}
                onChange={(event) => search.setValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    search.submit();
                  }
                }}
              />
              {search.value ? (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  onClick={search.clear}
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          ) : null}
          <Button variant="ghost" className="h-11 w-11 rounded-2xl p-0" onClick={search.submit}>
            <Search style={{ width: 24, height: 24 }} />
          </Button>
        </div>

        <div className="relative" ref={notificationRef}>
          <Button variant="ghost" className="relative h-11 w-11 rounded-2xl p-0" onClick={toggleNotifications}>
            <Bell style={{ width: 24, height: 24 }} />
            {unreadCount ? (
              <span className="absolute right-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                {unreadCount}
              </span>
            ) : null}
          </Button>

          {notificationOpen ? (
            <div className="absolute right-0 top-full mt-3 w-80 rounded-2xl border border-slate-200 bg-white px-[5px] py-[5px] shadow-xl" style={{ zIndex: 900 }}>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="font-title text-sm font-semibold text-slate-900">Notifications</div>
                <button
                  type="button"
                  className="text-xs font-semibold text-amber-600 transition hover:text-amber-700"
                  onClick={() => setShowUnreadOnly((prev) => !prev)}
                >
                  {showUnreadOnly ? "Show all" : "Unread only"}
                </button>
              </div>
              <div className="space-y-1">
                {visibleNotifications.length ? (
                  visibleNotifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setNotifications((current) => current.map((notification) => (
                          notification.id === item.id
                            ? { ...notification, read: !notification.read }
                            : notification
                        )));
                      }}
                      className={`rounded-xl px-4 py-3 transition ${item.read ? "hover:bg-slate-50" : "bg-amber-50 hover:bg-amber-100/80"}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${item.read ? "bg-slate-200" : "bg-amber-500"}`} />
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                          <div className="mt-0.5 text-xs text-slate-500">{item.description}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">No notifications</div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="relative flex items-center gap-2 cursor-pointer focus:outline-none"
          >
            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-amber-500 to-orange-500 text-sm font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-red-500 bg-red-500">
                <span className="text-[7px] font-bold leading-none text-white">A</span>
              </div>
            </div>
          </button>

          {userMenuOpen ? (
            <div className="absolute right-0 top-full mt-3 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white px-[5px] py-[5px] shadow-xl" style={{ zIndex: 900 }}>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate("/settings/personal");
                }}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100 cursor-pointer"
              >
                <Settings2 className="h-4 w-4 text-slate-500" />
                <span>Settings</span>
              </button>
              <div className="mx-2 border-t border-slate-100" />
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  handleSignOut();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-rose-600 transition hover:bg-rose-100 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
