import { useEffect, useState } from "react";
import { Card } from "@components/ui/card";
import { DollarSign, ShoppingCart, Clock, TrendingUp, TrendingDown, Package } from "lucide-react";
import { useAuth } from "@hooks/useAuth";
import { dashboardService } from "@services/dashboardService";
import { useCountUp } from "@hooks/useCountUp";
import { useUiStore } from "@store/uiStore";
import { useTranslation } from "@hooks/useTranslation";

const formatCurrency = (amount) => {
  if (amount == null) return "₫0";
  const num = Number(amount);
  if (num >= 1_000_000) return `₫${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `₫${(num / 1_000).toFixed(1)}K`;
  return `₫${num.toLocaleString("en-US")}`;
};

const StaffDashboardPage = () => {
  const { user } = useAuth();
  const { currentLanguage: lang } = useUiStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    let mounted = true;
    const fetchDashboard = async () => {
      try {
        const result = await dashboardService.getStaffDashboard();
        if (mounted && result) setData(result);
      } catch (e) {
        console.warn("Staff dashboard fetch failed:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = data?.stats || {};
  const totalRevenue = useCountUp(stats.totalRevenue || 0);
  const totalOrders = useCountUp(stats.totalOrders || 0);
  const pendingOrders = useCountUp(stats.pendingOrders || 0);
  const totalCustomers = useCountUp(stats.totalCustomers || 0);

  if (loading) {
    return (
      <section className="space-y-6">
        <h1 className="font-title text-2xl font-bold text-slate-900">{t("dashboard.staffTitle")}</h1>
        <p className="text-sm text-slate-500">{t("dashboard.loading")}</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <h1 className="font-title text-2xl font-bold text-slate-900 dark:text-amber-50">{t("dashboard.staffTitle")}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
        <Card className="p-5 flex items-center gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-orange-500 text-white">
            <DollarSign className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{t("dashboard.totalRevenue")}</div>
            <div className="font-title text-2xl font-bold text-slate-900 mt-1 font-mono">{totalRevenue ? formatCurrency(totalRevenue) : "₫0"}</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-500 text-white">
            <ShoppingCart className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{t("dashboard.completedOrders")}</div>
            <div className="font-title text-2xl font-bold text-slate-900 mt-1 font-mono">{totalOrders || 0}</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-rose-500 to-red-500 text-white">
            <Clock className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{t("dashboard.avgOrderValue")}</div>
            <div className="font-title text-2xl font-bold text-slate-900 mt-1 font-mono">{pendingOrders || 0}</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-purple-500 to-pink-500 text-white">
            <Package className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{t("dashboard.activeCarts")}</div>
            <div className="font-title text-2xl font-bold text-slate-900 mt-1 font-mono">{totalCustomers || 0}</div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="font-title text-lg font-bold text-slate-900 mb-2">{t("dashboard.quickActions")}</div>
        <p className="text-sm text-slate-500 mb-4">{t("dashboard.manageTasks")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 p-4 hover:border-amber-400 transition cursor-pointer">
            <div className="font-title text-sm font-semibold text-slate-900">{t("nav.orders")}</div>
            <div className="text-xs text-slate-500 mt-1">{t("dashboard.approveOrders")}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 hover:border-amber-400 transition cursor-pointer">
            <div className="font-title text-sm font-semibold text-slate-900">{t("nav.articles")}</div>
            <div className="text-xs text-slate-500 mt-1">{t("dashboard.createEditArticles")}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 hover:border-amber-400 transition cursor-pointer">
            <div className="font-title text-sm font-semibold text-slate-900">{t("nav.supportChat")}</div>
            <div className="text-xs text-slate-500 mt-1">{t("dashboard.respondToCustomers")}</div>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default StaffDashboardPage;
