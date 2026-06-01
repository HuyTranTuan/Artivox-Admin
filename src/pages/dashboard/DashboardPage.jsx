import { useEffect, useState } from "react";

import { dashboardService } from "@services/dashboardService";
import { useTranslation } from "@hooks/useTranslation";
import {
  WidgetsSection,
  ChartsSection,
  TablesSection,
} from "@/layouts/DashoardLayout/components/DashboardSection";

const DashboardPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const { widgets, tables, charts } = data || {};
  console.log("tables", tables);

  if (loading) {
    return (
      <section className="space-y-6">
        <h1 className="font-title text-2xl font-bold text-slate-900">
          {t("dashboard.title")}
        </h1>
        <p className="text-sm text-slate-500">{t("dashboard.loading")}</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* ── Section 1: Widgets (always first) ── */}
      <WidgetsSection widgets={widgets} />

      {/* ── Section 2: Charts (always second) ── */}
      <ChartsSection charts={charts} />

      {/* ── Section 3: Tables (always last) ── */}
      <TablesSection tables={tables} />
    </section>
  );
};

export default DashboardPage;
