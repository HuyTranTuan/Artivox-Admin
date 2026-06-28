import { useEffect, useState } from "react";

import { dashboardService } from "@services/dashboardService";
import { WidgetsSection, ChartsSection, TablesSection } from "@/layouts/DashoardLayout/components/DashboardSection";
import Loading from "@/components/Loading";

const DashboardPage = () => {
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

  if (loading) {
    return <Loading text={false} height={"20"} width={"20"} />;
  }

  return (
    <section className="space-y-6">
      {/* Section 1: Widgets (always first) */}
      <WidgetsSection widgets={widgets} />

      {/* Section 2: Charts (always second) */}
      <ChartsSection charts={charts} />

      {/* Section 3: Tables (always last) */}
      <TablesSection tables={tables} />
    </section>
  );
};

export default DashboardPage;
