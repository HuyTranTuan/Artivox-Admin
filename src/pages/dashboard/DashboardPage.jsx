import { useEffect, useState } from "react";

import { dashboardService } from "@services/dashboardService";
import { useTranslation } from "@hooks/useTranslation";
import {
  WidgetsSection,
  ChartsSection,
  TablesSection,
} from "@/layouts/DashoardLayout/components/DashboardSection";
import Loading from "@/components/Loading";

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

  if (loading) {
    return <Loading text={false} height={"20"} width={"20"} />;
  }

  return (
    <section className="space-y-6">
      {/* â”€â”€ Section 1: Widgets (always first) â”€â”€ */}
      <WidgetsSection widgets={widgets} />

      {/* â”€â”€ Section 2: Charts (always second) â”€â”€ */}
      <ChartsSection charts={charts} />

      {/* â”€â”€ Section 3: Tables (always last) â”€â”€ */}
      <TablesSection tables={tables} />
    </section>
  );
};

export default DashboardPage;