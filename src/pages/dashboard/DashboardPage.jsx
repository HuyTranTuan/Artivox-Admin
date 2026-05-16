import { useEffect, useMemo, useState } from "react";
import { Card } from "@components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Box, Clock, Activity, BarChart3, Package, UserCheck, MessageCircle } from "lucide-react";
import { useCountUp } from "@hooks/useCountUp";
import { useAuth } from "@hooks/useAuth";
import { dashboardService } from "@services/dashboardService";
import { PieChart as PieChartComponent } from "@components/ui/PieChart";

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

const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState("revenue"); // "revenue" | "customers"

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

  if (loading) {
    return (
      <section className="space-y-6">
        <h1 className="font-title text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-500">Loading dashboard data...</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Widgets Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard label="Total Revenue" value={revenueDisplay} icon={DollarSign} color="from-amber-500 to-orange-500" />
        <SummaryCard label="Completed Orders" value={ordersDisplay} icon={ShoppingCart} color="from-emerald-500 to-teal-500" />
        <SummaryCard label="Avg Order Value" value={aovDisplay} icon={BarChart3} color="from-purple-500 to-pink-500" />
        <SummaryCard label="Abandoned Cart Rate" value={abandonedDisplay} icon={Clock} color="from-rose-500 to-red-500" />
      </div>

      {/* Active Carts Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-xs text-slate-500 uppercase tracking-wider">Active Carts</div>
          <div className="font-title text-lg font-bold text-slate-900 mt-1">{widgets.totalActiveCarts || 0}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-xs text-slate-500 uppercase tracking-wider">Abandoned Carts</div>
          <div className="font-title text-lg font-bold text-rose-500 mt-1">{widgets.totalAbandonedCarts || 0}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Time Series Chart */}
        <Card className="xl:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="font-title text-lg font-bold text-slate-900">30-Day Trend</div>
              <div className="text-sm text-slate-500 mt-1">{chartView === "revenue" ? "Revenue" : "New Customers"}</div>
            </div>
            <div className="flex bg-slate-100 p-0.5 rounded-lg">
              <button
                onClick={() => setChartView("revenue")}
                className={`px-3 py-1 text-xs rounded-md font-medium transition ${chartView === "revenue" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
              >
                Revenue
              </button>
              <button
                onClick={() => setChartView("customers")}
                className={`px-3 py-1 text-xs rounded-md font-medium transition ${chartView === "customers" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
              >
                Customers
              </button>
            </div>
          </div>
          {lineSeries.length > 0 ? (
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
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">No time series data</p>
          )}
        </Card>

        {/* Category Revenue Pie Chart */}
        <Card className="p-6">
          <div className="font-title text-lg font-bold text-slate-900 mb-1">Revenue by Product Type</div>
          <div className="text-sm text-slate-500 mb-6">Breakdown by category</div>
          {pieData.length > 0 ? (
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
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">No revenue data</p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Staff by Articles */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="font-title text-lg font-bold text-slate-900">Top Staff by Articles</div>
              <div className="text-sm text-slate-500 mt-1">Most published articles</div>
            </div>
            <UserCheck className="h-5 w-5 text-slate-400" />
          </div>
          {(tables.topStaffByArticles || []).length > 0 ? (
            <div className="space-y-3">
              {(tables.topStaffByArticles || []).map((staff, i) => (
                <div key={staff.id || i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 font-bold text-sm shrink-0">
                    {staff.fullName?.charAt(0)?.toUpperCase() || "S"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-title text-sm font-semibold text-slate-900 truncate">{staff.fullName || "Unknown"}</div>
                    <div className="text-xs text-slate-500">{staff._count?.articles || staff.articleCount || 0} articles</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-title text-sm font-bold text-slate-900">#{i + 1}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">No staff data</p>
          )}
        </Card>

        {/* Top Staff by Chat */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="font-title text-lg font-bold text-slate-900">Top Staff by Chat</div>
              <div className="text-sm text-slate-500 mt-1">Most active in support</div>
            </div>
            <MessageCircle className="h-5 w-5 text-slate-400" />
          </div>
          {(tables.topStaffByChatRooms || []).length > 0 ? (
            <div className="space-y-3">
              {(tables.topStaffByChatRooms || []).map((staff, i) => (
                <div key={staff.id || i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold text-sm shrink-0">
                    {staff.fullName?.charAt(0)?.toUpperCase() || "S"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-title text-sm font-semibold text-slate-900 truncate">{staff.fullName || "Unknown"}</div>
                    <div className="text-xs text-slate-500">{staff._count?.chatRooms || staff.chatCount || 0} chats</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-title text-sm font-bold text-slate-900">#{i + 1}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">No chat data</p>
          )}
        </Card>
      </div>

      {/* Top Selling Products */}
      {(tables.topProductsWithDetails || []).length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="font-title text-lg font-bold text-slate-900">Top Products</div>
              <div className="text-sm text-slate-500 mt-1">Best selling products</div>
            </div>
            <Box className="h-5 w-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {(tables.topProductsWithDetails || []).map((p, i) => (
              <div key={p.productId || i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 font-bold text-sm shrink-0">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-title text-sm font-semibold text-slate-900 truncate">{p.name || "Unknown Product"}</div>
                  <div className="text-xs text-slate-500">
                    {p.totalSold || 0} sold · {p.type || "N/A"}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-title text-sm font-bold text-slate-900">{formatCurrency(p.estimatedRevenue)}</div>
                  <div className="text-xs text-slate-500">revenue</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </section>
  );
};

export default DashboardPage;
