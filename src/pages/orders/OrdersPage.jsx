import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import { Card } from "@components/ui/card";
import {
  DataTable,
  TableToolbar,
  TablePagination,
  useDataTable,
} from "@components/DataTable";
import { useExpandableSearch } from "@hooks/useExpandableSearch";
import { useDebounce } from "@hooks/useDebounce";
import { useTranslation } from "@hooks/useTranslation";
import { usePaginatedApi } from "@hooks/usePaginatedApi";
import { orderService } from "@services/orderService";

const fmtDate = (d) => {
  if (!d) return "”";
  try {
    const x = new Date(d);
    return isNaN(x)
      ? d
      : `${String(x.getDate()).padStart(2, "0")}/${String(x.getMonth() + 1).padStart(2, "0")}/${x.getFullYear()}`;
  } catch {
    return d;
  }
};

const statusColor = {
  PENDING: "text-amber-600",
  PAID: "text-emerald-600",
  REFUND_PENDING: "text-rose-600",
  PROCESSING: "text-blue-600",
  SHIPPED: "text-indigo-600",
  DELIVERED: "text-emerald-600",
  CANCELLED: "text-slate-500 dark:text-white",
};

const OrdersPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    data: orders,
    loading,
    page: currentPage,
    totalPages,
    totalItems,
    setPage,
    refetch,
  } = usePaginatedApi((params) => orderService.listOrders({ ...params }), {
    defaultLimit: 20,
    pageParam: "page",
  });

  const [activeFilters, setActiveFilters] = useState({ status: null });
  const search = useExpandableSearch();
  const debouncedSearch = useDebounce(search.value, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeFilters]);

  const fmtPrice = (v) =>
    v
      ? new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(v)
      : "”";

  const filtered = useMemo(() => {
    let r = orders.filter(
      (o) =>
        o.status === "COMPLETED" ||
        o.status === "CANCELED" ||
        o.status === "DELIVERED",
    );
    const kw = debouncedSearch.toLowerCase();
    if (kw)
      r = r.filter((o) => {
        const codeStr = (o.orderNumber || o.code || o.id || "")
          .toString()
          .toLowerCase();
        let custStr = "";
        if (o.customer) {
          if (typeof o.customer === "string")
            custStr = o.customer.toLowerCase();
          else if (typeof o.customer === "object")
            custStr = (
              o.customer.fullName ||
              o.customer.name ||
              o.customer.email ||
              o.customer.phone ||
              o.customer.id ||
              ""
            )
              .toString()
              .toLowerCase();
        }
        return codeStr.includes(kw) || custStr.includes(kw);
      });
    if (activeFilters.status)
      r = r.filter((o) => o.status === activeFilters.status);
    return r;
  }, [orders, debouncedSearch, activeFilters]);

  const statusOptions = useMemo(
    () => ["COMPLETED", "CANCELED", "DELIVERED"],
    [],
  );

  const dt = useDataTable({
    rows: filtered,
    keyField: "id",
    pageSize: 20,
    exportFilename: "orders",
    onExportRow: (r) => {
      let custStr = "”";
      if (r.customer) {
        if (typeof r.customer === "string") custStr = r.customer;
        else if (typeof r.customer === "object")
          custStr =
            r.customer.fullName ||
            r.customer.name ||
            r.customer.email ||
            r.customer.phone ||
            r.customer.id ||
            "”";
      }
      return {
        Code: r.code || r.id,
        Customer:
          typeof custStr === "object" ? JSON.stringify(custStr) : custStr,
        Amount: r.totalAmount || r.amount,
        Status: r.status,
        Date: r.createdAt,
      };
    },
  });

  const columns = [
    {
      key: "id",
      label: t("orders.code"),
      width: "1.2fr",
      render: (r) => (
        <div className="font-semibold text-xs truncate">
          {r.orderNumber || r.code || r.id}
        </div>
      ),
    },
    {
      key: "customer",
      label: t("orders.customer"),
      width: "1.5fr",
      render: (r) => {
        let custStr = "”";
        if (r.customer) {
          if (typeof r.customer === "string") custStr = r.customer;
          else if (typeof r.customer === "object") {
            const idStr = r.customer.id ? String(r.customer.id) : "";
            custStr =
              r.customer.fullName ||
              r.customer.name ||
              r.customer.email ||
              r.customer.phone ||
              idStr ||
              "”";
          }
        }
        return <div className="text-sm">{String(custStr)}</div>;
      },
    },
    {
      key: "totalAmount",
      label: t("orders.amount"),
      render: (r) => (
        <div className="font-semibold">
          {fmtPrice(r.totalAmount || r.amount)}
        </div>
      ),
    },
    {
      key: "status",
      label: t("common.status"),
      render: (r) => (
        <span className={`text-xs font-medium ${statusColor[r.status] || ""}`}>
          {t(`status.${r.status}`, r.status)}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: t("orders.date"),
      render: (r) => <span className="text-xs">{fmtDate(r.createdAt)}</span>,
    },
    {
      key: "actions",
      label: t("common.actions"),
      sortable: false,
      width: "150px",
      render: (row) => (
        <button
          onClick={() =>
            navigate(`/orders/${row.orderNumber || row.id || row.code}`)
          }
          className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-blue-600 hover:bg-blue-50 transition"
          style={{ padding: 5 }}
        >
          <Eye style={{ width: 16, height: 16 }} />
        </button>
      ),
    },
  ];

  return (
    <section className="space-y-6">
      <Card className="p-6">
        <TableToolbar
          title={t("orders.title")}
          onRefresh={refetch}
          onExportCsv={dt.handleExport}
          search={search}
          searchPlaceholder={t("orders.searchPlaceholder")}
          filterOptions={[
            {
              key: "status",
              label: t("common.status"),
              values: statusOptions,
              valuePrefix: "status.",
            },
          ]}
          activeFilters={activeFilters}
          onFilterChange={(key, val) =>
            setActiveFilters((p) => ({ ...p, [key]: val }))
          }
        />
        <DataTable
          columns={columns}
          rows={dt.paginated}
          keyField="id"
          loading={loading}
          emptyMessage={t("orders.noOrders", "No orders found.")}
          sortField={dt.sortField}
          sortDir={dt.sortDir}
          onSort={dt.toggleSort}
          checkedIds={dt.checkedIds}
          onToggleRow={dt.toggleRow}
          onToggleAll={dt.toggleAll}
          allChecked={dt.allChecked}
          someChecked={dt.someChecked}
        />
        <TablePagination
          currentPage={dt.currentPage}
          totalPages={dt.totalPages}
          totalItems={dt.totalItems}
          pageSize={20}
          onPage={dt.setPage}
        />
      </Card>
    </section>
  );
};

export default OrdersPage;
