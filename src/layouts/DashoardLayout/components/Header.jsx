import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, LogOut, Menu, Search, Settings2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { useAuth } from "@hooks/useAuth";
import { useExpandableSearch } from "@hooks/useExpandableSearch";
import { useUiStore } from "@store/uiStore";
import { useNotificationSocket } from "@hooks/useNotificationSocket";

const initialNotifications = [
  { id: 1, title: "New refund request", description: "Order #AVX-201 needs approval.", read: false },
  { id: 2, title: "Low stock alert", description: "Resin Material 08 is below threshold.", read: false },
  { id: 3, title: "Campaign published", description: "Summer Launch article is now live.", read: true },
];

const ThemeSwitch = ({ theme, onChange }) => (
  <div className="flex items-center gap-2 px-2 py-2">
    <span className="text-xs font-medium text-slate-500">Light</span>
    <button
      onClick={() => onChange(theme === "light" ? "dark" : "light")}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === "dark" ? "bg-amber-500" : "bg-slate-200"}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === "dark" ? "translate-x-6" : "translate-x-1"}`} />
    </button>
    <span className="text-xs font-medium text-slate-500">Dark</span>
  </div>
);

const LanguageSwitch = ({ language, onChange }) => (
  <div className="flex items-center gap-2 px-2 py-2">
    <span className="text-xs font-medium text-slate-500">EN</span>
    <button
      onClick={() => onChange(language === "en" ? "vi" : "en")}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${language === "vi" ? "bg-amber-500" : "bg-slate-200"}`}
    >
      <span
        className={`inline-flex h-4 w-4 items-center justify-center transform rounded-full bg-white text-[8px] font-bold transition-transform ${language === "vi" ? "translate-x-6" : "translate-x-1"}`}
      >
        {language === "vi" ? "VN" : "EN"}
      </span>
    </button>
    <span className="text-xs font-medium text-slate-500">VN</span>
  </div>
);

export const Header = () => {
  const { toggleSidebar, toggleMobileSidebar, theme, setTheme, currentLanguage, setCurrentLanguage } = useUiStore();
  const { user, handleSignOut } = useAuth();
  const navigate = useNavigate();
  const search = useExpandableSearch();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const socketNotifications = useNotificationSocket(user?.staffId || user?.id, user?.id, !!user?.id);
  const [notifications, setNotifications] = useState(initialNotifications);

  useEffect(() => {
    if (socketNotifications.notifications.length > 0) {
      setNotifications((prev) => {
        const merged = [...socketNotifications.notifications];
        prev.forEach((n) => {
          if (!merged.some((m) => m.id === n.id)) merged.push(n);
        });
        return merged.slice(0, 50);
      });
    }
  }, [socketNotifications.notifications]);

  const menuRef = useRef(null);
  const notificationRef = useRef(null);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);
  const visibleNotifications = useMemo(() => (showUnreadOnly ? notifications.filter((item) => !item.read) : notifications), [notifications, showUnreadOnly]);

  const handleToggle = () => {
    if (window.innerWidth < 1024) toggleMobileSidebar();
    else toggleSidebar();
  };

  useEffect(() => {
    const handler = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setUserMenuOpen(false);
      if (notificationRef.current && !notificationRef.current.contains(event.target)) setNotificationOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleLanguageChange = (lang) => {
    setCurrentLanguage(lang);
  };

  return (
    <header
      className={`sticky top-0 z-30 flex items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur lg:px-6 ${
        theme === "dark" ? "border-slate-800 bg-slate-900/80" : "border-slate-200/70 bg-white/70"
      }`}
    >
      {/* Left: Menu + Title */}
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="ghost" className="h-10 w-10 rounded-xl p-0" onClick={handleToggle}>
          <Menu style={{ width: 30, height: 30 }} />
        </Button>
        <div className="min-w-0">
          <div className={`font-title text-sm lg:text-base font-bold truncate ${theme === "dark" ? "text-slate-50" : "text-slate-950"}`}>Artivox Admin</div>
        </div>
      </div>

      {/* Right: Search + Notifications + User */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Search */}
        <div ref={search.containerRef} className="flex items-center">
          {search.isOpen ? (
            <div className="relative w-48 sm:w-56">
              <Input
                ref={search.inputRef}
                className="h-10 pl-3 pr-8 text-sm"
                placeholder="Search..."
                value={search.value}
                onChange={(e) => search.setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") search.submit();
                }}
              />
              {search.value ? (
                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700" onClick={search.clear}>
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          ) : null}
          <Button variant="ghost" className="h-10 w-10 rounded-xl p-0" onClick={search.submit}>
            <Search style={{ width: 30, height: 30 }} />
          </Button>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <Button variant="ghost" className="relative h-10 w-10 rounded-xl p-0" onClick={() => setNotificationOpen(!notificationOpen)}>
            <Bell style={{ width: 30, height: 30 }} />
            {unreadCount ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                {unreadCount}
              </span>
            ) : null}
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${
                socketNotifications.socketStatus === "connected"
                  ? "bg-emerald-500 animate-pulse"
                  : socketNotifications.socketStatus === "connecting"
                    ? "bg-amber-500 animate-pulse"
                    : socketNotifications.socketStatus === "error"
                      ? "bg-rose-500"
                      : "bg-slate-300"
              }`}
              title={`Socket: ${socketNotifications.socketStatus}`}
            />
          </Button>

          {notificationOpen && (
            <div
              className={`absolute right-0 top-full mt-2 w-80 rounded-xl border shadow-xl px-1 py-1 ${theme === "dark" ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}
              style={{ zIndex: 900 }}
            >
              <div className="flex items-center justify-between px-4 py-2">
                <div className={`font-title text-sm font-semibold ${theme === "dark" ? "text-slate-50" : "text-slate-900"}`}>Notifications</div>
                <button type="button" className="text-xs font-semibold text-amber-600 hover:text-amber-700" onClick={() => setShowUnreadOnly((p) => !p)}>
                  {showUnreadOnly ? "Show all" : "Unread only"}
                </button>
              </div>
              <div className="space-y-1">
                {visibleNotifications.length ? (
                  visibleNotifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setNotifications((cur) => cur.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
                        navigate(`/notifications/${item.id}`);
                        setNotificationOpen(false);
                      }}
                      className={`rounded-lg px-4 py-2.5 transition cursor-pointer ${item.read ? "hover:bg-slate-50" : "bg-amber-50 hover:bg-amber-100/80"}`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.read ? "bg-slate-200" : "bg-amber-500"}`} />
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-semibold truncate ${theme === "dark" ? "text-slate-50" : "text-slate-900"}`}>{item.title}</div>
                          <div className="mt-0.5 text-xs text-slate-500 truncate">{item.description}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-slate-500">No notifications</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={`flex items-center gap-2 cursor-pointer focus:outline-none rounded-lg px-1.5 py-1 transition ${theme === "dark" ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-amber-500 to-orange-500 text-base font-bold text-white shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="hidden lg:block min-w-0 max-w-[120px]">
              <div className={`text-sm font-semibold leading-tight truncate ${theme === "dark" ? "text-slate-50" : "text-slate-900"}`}>{user?.name || "User"}</div>
              <div className="text-[11px] text-slate-500 leading-tight truncate">{user?.email || "user@artivox.vn"}</div>
            </div>
          </button>

          {userMenuOpen && (
            <div
              className={`absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border shadow-xl px-1 py-1 ${theme === "dark" ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}
              style={{ zIndex: 900 }}
            >
              <div className="px-4 py-3">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Theme</div>
                <ThemeSwitch theme={theme} onChange={handleThemeChange} />
              </div>

              <div className={`mx-2 border-t ${theme === "dark" ? "border-slate-800" : "border-slate-100"}`} />

              <div className="px-4 py-3">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Language</div>
                <LanguageSwitch language={currentLanguage} onChange={handleLanguageChange} />
              </div>

              <div className={`mx-2 border-t ${theme === "dark" ? "border-slate-800" : "border-slate-100"}`} />

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate("/settings/personal");
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition cursor-pointer ${theme === "dark" ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"}`}
              >
                <Settings2 className="h-4 w-4 text-slate-500 shrink-0" />
                <span>Settings</span>
              </button>

              <div className={`mx-2 border-t ${theme === "dark" ? "border-slate-800" : "border-slate-100"}`} />

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  handleSignOut();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-rose-600 transition hover:bg-rose-100 cursor-pointer"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
