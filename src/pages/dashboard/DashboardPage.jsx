import { useEffect, useMemo, useState } from "react";
import { Card } from "@components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Box, Clock, Activity, BarChart3, Package, UserCheck, MessageCircle } from "lucide-react";
import { useCountUp } from "@hooks/useCountUp";
import { useAuth } from "@hooks/useAuth";
import { dashboardService } from "@services/dashboardService";
import { PieChart as PieChartComponent } from "@components/ui/PieChart";
import { useUiStore } from "@store/uiStore";
import { useTranslation } from "@hooks/useTranslation";

const buildLinePath = (data, width, height, padding = 20, key = "value") => {
  if (!data || data.length === 0) return "";
  const values = data.map((d) => d[key]);
  const maxV = Math.max(...values);
  const minV = Math.min(...values);
  const range = maxV - minV || 1;
  const stepX = (width - padding * 2) / (data.length - 1);
  return data
    .map((d, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((d[key] - minV) / range) * (height - padding * 2);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
};

const buildAreaPath = (data, width, height, padding = 20, key = "value") => {
  if (!data || data.length === 0) return "";
  const linePath = buildLinePath(data, width, height, padding, key);
  const stepX = (width - padding * 2) / (data.length - 1);
  const lastX = padding + (data.length - 1) * stepX;
  const firstX = padding;
  return `${linePath} L ${lastX} ${height - padding} L ${firstX} ${height - padding} Z`;
};

const SummaryCard = ({ label, value, change, up, icon: Icon, color }) => (
  <Card className="p-5 flex items-center gap-5">
    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${color} text-white`}>
      <Icon className="h-7 w-7" />
    </div>
    <div className="min-w-0 flex-1">
      <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</div>
      <div className="font-title text-2xl font-bold text-slate-900 mt-1 font-mono">{value}</div>
      {change != null && (
        <div className={`flex items-center gap-1 mt-1 text-xs font-semibold ${up ? "text-emerald-600" : "text-rose-500"}`}>
          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {change}
        </div>
      )}
    </div>
  </Card>
);

const formatCurrency = (amount) => {
  if (amount == null) return "₫0";
  const num = Number(amount);
  if (num >= 1_000_000) return `₫${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `₫${(num / 1_000).toFixed(1)}K`;
  return `₫${num.toLocaleString("en-US")}`;
};

// ─── Widgets Section ─────────────────────────────────────────────
const WidgetsSection = ({ widgets, totalRevenue, totalOrders, avgOrder, abandonedRate, revenueDisplay, ordersDisplay, aovDisplay, abandonedDisplay }) => {
  const hasFinancialKPIs = widgets.totalRevenue != null || widgets.totalCompletedOrders != null || widgets.averageOrderValue != null;
  const hasCartStats = widgets.totalActiveCarts != null || widgets.totalAbandonedCarts != null;

  if (!hasFinancialKPIs && !hasCartStats) return null;

  const { t } = useTranslation();

  return (
    <>
      {hasFinancialKPIs && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {widgets.totalRevenue != null && <SummaryCard label={t("dashboard.totalRevenue")} value={revenueDisplay} icon={DollarSign} color="from-amber-500 to-orange-500" />}
          {widgets.totalCompletedOrders != null && (
            <SummaryCard label={t("dashboard.completedOrders")} value={ordersDisplay} icon={ShoppingCart} color="from-emerald-500 to-teal-500" />
          )}
          {widgets.averageOrderValue != null && <SummaryCard label={t("dashboard.avgOrderValue")} value={aovDisplay} icon={BarChart3} color="from-purple-500 to-pink-500" />}
          {widgets.abandonedCartRate != null && <SummaryCard label={t("dashboard.abandonedCartRate")} value={abandonedDisplay} icon={Clock} color="from-rose-500 to-red-500" />}
        </div>
      )}

      {hasCartStats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {widgets.totalActiveCarts != null && (
            <Card className="p-4 text-center">
              <div className="text-xs text-slate-500 uppercase tracking-wider">{t("dashboard.activeCarts")}</div>
              <div className="font-title text-lg font-bold text-slate-900 mt-1">{widgets.totalActiveCarts}</div>
            </Card>
          )}
          {widgets.totalAbandonedCarts != null && (
            <Card className="p-4 text-center">
              <div className="text-xs text-slate-500 uppercase tracking-wider">{t("dashboard.activeCarts")}</div>
              <div className="font-title text-lg font-bold text-rose-500 mt-1">{widgets.totalAbandonedCarts}</div>
            </Card>
          )}
        </div>
      )}
    </>
  );
};

// ─── Charts Section ──────────────────────────────────────────────
const ChartsSection = ({ chartView, setChartView, lineSeries, pieData, formatCurrency }) => {
  const { t } = useTranslation();
  const hasTimeSeries = lineSeries.length > 0;
  const hasPieChart = pieData.length > 0;

  if (!hasTimeSeries && !hasPieChart) return null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Time Series Chart */}
      {hasTimeSeries && (
        <Card className="xl:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="font-title text-lg font-bold text-slate-900">{t("dashboard.thirtyDayTrend")}</div>
              <div className="text-sm text-slate-500 mt-1">{chartView === "revenue" ? t("dashboard.revenue") : t("dashboard.customers")}</div>
            </div>
            <div className="flex bg-slate-100 p-0.5 rounded-lg">
              <button
                onClick={() => setChartView("revenue")}
                className={`px-3 py-1 text-xs rounded-md font-medium transition ${chartView === "revenue" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
              >
                {t("dashboard.revenue")}
              </button>
              <button
                onClick={() => setChartView("customers")}
                className={`px-3 py-1 text-xs rounded-md font-medium transition ${chartView === "customers" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
              >
                {t("dashboard.customers")}
              </button>
            </div>
          </div>
          <div className="w-full overflow-hidden">
            <svg viewBox="0 0 600 200" className="w-full h-auto" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3, 4].map((i) => {
                const y = 20 + (i / 4) * (200 - 40);
                return <line key={i} x1="20" y1={y} x2={600 - 20} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
              })}
              <path d={buildAreaPath(lineSeries, 600, 200)} fill="url(#areaGrad)" />
              <path d={buildLinePath(lineSeries, 600, 200)} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              {lineSeries.map((d, i) => {
                if (lineSeries.length < 2) return null;
                const values = lineSeries.map((r) => r.value);
                const maxV = Math.max(...values);
                const minV = Math.min(...values);
                const range = maxV - minV || 1;
                const stepX = (600 - 40) / (lineSeries.length - 1);
                const x = 20 + i * stepX;
                const y = 200 - 20 - ((d.value - minV) / range) * (200 - 40);
                return <circle key={d.label} cx={x} cy={y} r="4" fill="#fff" stroke="#f59e0b" strokeWidth="2" />;
              })}
              {lineSeries
                .filter((_, i) => i % 5 === 0 || i === lineSeries.length - 1)
                .map((d, i, arr) => {
                  if (lineSeries.length < 2) return null;
                  const stepX = (600 - 40) / (lineSeries.length - 1);
                  const idx = lineSeries.indexOf(d);
                  const x = 20 + idx * stepX;
                  return (
                    <text key={d.label} x={x} y={200 - 4} textAnchor="middle" className="text-[10px] fill-slate-500">
                      {d.label}
                    </text>
                  );
                })}
            </svg>
          </div>
        </Card>
      )}

      {/* Category Revenue Pie Chart */}
      {hasPieChart && (
        <Card className="p-6">
          <div className="font-title text-lg font-bold text-slate-900 mb-1">{t("dashboard.revenueByProductType")}</div>
          <div className="text-sm text-slate-500 mb-6">{t("dashboard.breakdownByCategory")}</div>
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="flex-1 max-w-xs">
              <PieChartComponent data={pieData} width={240} height={240} />
            </div>
            <div className="flex-1 space-y-4">
              {pieData.map((c) => (
                <div key={c.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-700">{c.name}</div>
                    <div className="text-xs text-slate-500">{formatCurrency(c.value)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

// ─── Tables Section ──────────────────────────────────────────────
const TablesSection = ({ tables, formatCurrency }) => {
  const { t } = useTranslation();
  const hasStaffByArticles = (tables.topStaffByArticles || []).length > 0;
  const hasStaffByChat = (tables.topStaffByChatRooms || []).length > 0;
  const hasTopProducts = (tables.topProductsWithDetails || []).length > 0;
  const hasStaffTables = hasStaffByArticles || hasStaffByChat;

  if (!hasStaffTables && !hasTopProducts) return null;

  return (
    <>
      {/* Staff Performance Tables */}
      {hasStaffTables && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {hasStaffByArticles && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="font-title text-lg font-bold text-slate-900">{t("dashboard.topStaffByArticles")}</div>
                  <div className="text-sm text-slate-500 mt-1">{t("dashboard.mostPublishedArticles")}</div>
                </div>
                <UserCheck className="h-5 w-5 text-slate-400" />
              </div>
              <div className="space-y-3">
                {(tables.topStaffByArticles || []).map((staff, i) => (
                  <div key={staff.id || i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 font-bold text-sm shrink-0">
                      {staff.fullName?.charAt(0)?.toUpperCase() || "S"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-title text-sm font-semibold text-slate-900 truncate">{staff.fullName || t("common.unknown")}</div>
                      <div className="text-xs text-slate-500">
                        {staff._count?.articles || staff.articleCount || 0} {t("dashboard.articles")}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-title text-sm font-bold text-slate-900">#{i + 1}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {hasStaffByChat && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="font-title text-lg font-bold text-slate-900">{t("dashboard.topStaffByChat")}</div>
                  <div className="text-sm text-slate-500 mt-1">{t("dashboard.mostActiveInSupport")}</div>
                </div>
                <MessageCircle className="h-5 w-5 text-slate-400" />
              </div>
              <div className="space-y-3">
                {(tables.topStaffByChatRooms || []).map((staff, i) => (
                  <div key={staff.id || i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold text-sm shrink-0">
                      {staff.fullName?.charAt(0)?.toUpperCase() || "S"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-title text-sm font-semibold text-slate-900 truncate">{staff.fullName || t("common.unknown")}</div>
                      <div className="text-xs text-slate-500">
                        {staff._count?.chatRooms || staff.chatCount || 0} {t("dashboard.chats")}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-title text-sm font-bold text-slate-900">#{i + 1}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Top Selling Products */}
      {hasTopProducts && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="font-title text-lg font-bold text-slate-900">{t("dashboard.topProducts")}</div>
              <div className="text-sm text-slate-500 mt-1">{t("dashboard.bestSelling")}</div>
            </div>
            <Box className="h-5 w-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {(tables.topProductsWithDetails || []).map((p, i) => (
              <div key={p.productId || i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 font-bold text-sm shrink-0">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-title text-sm font-semibold text-slate-900 truncate">{p.name || t("common.unknownProduct")}</div>
                  <div className="text-xs text-slate-500">
                    {p.totalSold || 0} {t("dashboard.sold")} · {p.type || t("common.na")}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-title text-sm font-bold text-slate-900">{formatCurrency(p.estimatedRevenue)}</div>
                  <div className="text-xs text-slate-500">{t("dashboard.revenueLabel")}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const { currentLanguage: lang } = useUiStore();
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState("revenue");
  useEffect(() => {
    let mounted = true;
    const fetchDashboard = async () => {
      try {
        const result = await dashboardService.getAdminDashboard();
        if (mounted && result) setData(result);
      } catch (e) {
        console.warn("Dashboard fetch failed:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  const widgets = data?.widgets || {};
  const tables = data?.tables || {};
  const charts = data?.charts || {};
  const timeSeries = charts.timeSeries30Days || [];
  const revenueByType = charts.revenueByProductType || {};

  const totalRevenue = useCountUp(widgets.totalRevenue || 0);
  const totalOrders = useCountUp(widgets.totalCompletedOrders || 0);
  const avgOrder = useCountUp(widgets.averageOrderValue || 0);
  const abandonedRate = useCountUp(widgets.abandonedCartRate || 0);

  // Transform revenueByProductType to pie data
  const pieData = useMemo(() => {
    const entries = Object.entries(revenueByType);
    if (entries.length === 0) return [];
    const colors = {
      MODEL: "#f59e0b",
      MATERIAL: "#10b981",
      TOOL: "#3b82f6",
    };
    return entries.map(([name, value]) => ({
      name,
      value: Number(value) || 0,
      color: colors[name] || "#a855f7",
    }));
  }, [revenueByType]);

  // Time series line data
  const lineSeries = useMemo(() => {
    if (timeSeries.length === 0) return [];
    return timeSeries.map((d) => ({
      label: d.date?.slice(5) || "",
      value: chartView === "revenue" ? d.revenue || 0 : d.newCustomers || 0,
    }));
  }, [timeSeries, chartView]);

  // Parse values for animated counters
  const revenueDisplay = totalRevenue ? formatCurrency(totalRevenue) : "₫0";
  const ordersDisplay = totalOrders ? String(totalOrders) : "0";
  const aovDisplay = avgOrder ? formatCurrency(avgOrder) : "₫0";
  const abandonedDisplay = abandonedRate ? `${abandonedRate}%` : "0%";

  // Determine which sections have data
  const hasWidgets = Object.keys(widgets).some((k) => widgets[k] != null);
  const hasCharts = lineSeries.length > 0 || pieData.length > 0;
  const hasTables = (tables.topStaffByArticles || []).length > 0 || (tables.topStaffByChatRooms || []).length > 0 || (tables.topProductsWithDetails || []).length > 0;

  if (loading) {
    return (
      <section className="space-y-6">
        <h1 className="font-title text-2xl font-bold text-slate-900">{t("dashboard.title")}</h1>
        <p className="text-sm text-slate-500">{t("dashboard.loading")}</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* ── Section 1: Widgets (always first) ── */}
      <WidgetsSection
        widgets={widgets}
        totalRevenue={totalRevenue}
        totalOrders={totalOrders}
        avgOrder={avgOrder}
        abandonedRate={abandonedRate}
        revenueDisplay={revenueDisplay}
        ordersDisplay={ordersDisplay}
        aovDisplay={aovDisplay}
        abandonedDisplay={abandonedDisplay}
      />

      {/* ── Section 2: Charts (always second) ── */}
      <ChartsSection chartView={chartView} setChartView={setChartView} lineSeries={lineSeries} pieData={pieData} formatCurrency={formatCurrency} />

      {/* ── Section 3: Tables (always last) ── */}
      <TablesSection tables={tables} formatCurrency={formatCurrency} />
    </section>
  );
};

export default DashboardPage;
