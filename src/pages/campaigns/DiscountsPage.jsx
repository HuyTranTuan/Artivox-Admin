import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Eye, Edit, Trash2, Percent, Gift, Clock } from "lucide-react";

import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Label } from "@components/ui/label";
import {
  DataTable,
  TableToolbar,
  TablePagination,
  useDataTable,
} from "@components/DataTable";
import { discountService } from "@services/discountService";
import useToast from "@hooks/useToast";
import { useExpandableSearch } from "@hooks/useExpandableSearch";
import { useDebounce } from "@hooks/useDebounce";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "@hooks/useTranslation";
import { useRBAC } from "@hooks/useRBAC";
import SummaryCard from "@/components/SummaryCard";

const formatDateLabel = (value) => {
  if (!value) return "”";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US");
};

const normalizeDiscount = (rawItem, index = 0) => {
  const id =
    rawItem?.id || rawItem?._id || rawItem?.slug || `discount-${index}`;
  const slug = rawItem?.slug || String(id);
  const code = rawItem?.code || String(id);
  const percentValue =
    rawItem?.percent ?? rawItem?.percentage ?? rawItem?.discountPercent;
  const amountValue = rawItem?.amount ?? rawItem?.discountAmount;
  const discountValue =
    rawItem?.discount ??
    rawItem?.value ??
    (percentValue != null
      ? `${percentValue}%`
      : amountValue != null
        ? `${amountValue}`
        : "”");

  return {
    id,
    slug,
    code,
    name: rawItem?.name || `Discount Campaign ${index + 1}`,
    type: rawItem?.type || "UNKNOWN",
    isActive: rawItem?.isActive,
    discount: String(discountValue),
    usage: Number(rawItem?.usedCount ?? 0),
    startDate: formatDateLabel(rawItem?.startsAt),
    endDate: formatDateLabel(rawItem?.expiresAt),
    _raw: {
      startsAt: rawItem?.startsAt,
      expiresAt: rawItem?.expiresAt,
      value: rawItem?.value,
    },
  };
};

const DiscountsPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [od, setOd] = useState(null);
  const [si, setSi] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ type: null });
  const search = useExpandableSearch();
  const debouncedSearch = useDebounce(search.value, 300);
  const { toastTopRight } = useToast();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { isAdmin, canCreate, canUpdate, canDelete, permissions: permission } = useRBAC();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await discountService.getDiscountsAdmin();
        if (mounted)
          setItems((Array.isArray(data) ? data : []).map(normalizeDiscount));
      } catch {
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const types = useMemo(
    () => [...new Set(items.map((i) => i.type).filter(Boolean))],
    [items],
  );

  const filtered = useMemo(() => {
    return items.filter((m) => {
      const kw = debouncedSearch.toLowerCase();
      const matchSearch =
        !kw ||
        m.name.toLowerCase().includes(kw) ||
        m.code.toLowerCase().includes(kw);
      const matchType = !activeFilters.type || m.type === activeFilters.type;
      return matchSearch && matchType;
    });
  }, [items, debouncedSearch, activeFilters]);

  const dt = useDataTable({
    rows: filtered,
    keyField: "id",
    pageSize: 20,
    exportFilename: "discounts",
    onExportRow: (r) => ({
      name: r.name,
      code: r.code,
      type: r.type,
      discount: r.discount,
      usage: r.usage,
      status: r.isActive ? "Active" : "Inactive",
      startDate: r.startDate,
      endDate: r.endDate,
    }),
  });

  const dynamicStats = useMemo(() => {
    const active = items.filter((i) => i.isActive).length;
    const totalRedeemed = items.reduce(
      (acc, i) => acc + (Number(i.usage) || 0),
      0,
    );
    const pItems = items.filter((i) => String(i.discount).includes("%"));
    const avgDiscount = pItems.length
      ? Math.round(
          pItems.reduce((acc, i) => acc + parseInt(i.discount), 0) /
            pItems.length,
        )
      : 0;
    return [
      {
        label: t("discounts.activeCampaigns"),
        value: String(active),
        icon: Percent,
      },
      {
        label: t("discounts.totalRedeemed"),
        value: totalRedeemed.toLocaleString(),
        icon: Gift,
      },
      {
        label: t("discounts.avgDiscount"),
        value: `${avgDiscount}%`,
        icon: Clock,
      },
    ];
  }, [items, t]);

  const columns = [
    {
      key: "name",
      label: t("common.name"),
      width: "2fr",
      render: (row) => <div className="font-semibold truncate">{row.name}</div>,
    },
    { key: "code", label: t("discounts.code"), width: "1fr" },
    { key: "type", label: t("common.type") },
    {
      key: "discount",
      label: t("discounts.discount"),
      render: (row) => (
        <span className="font-semibold text-emerald-600">{row.discount}</span>
      ),
    },
    {
      key: "usage",
      label: t("discounts.usage"),
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-950 rounded-full"
              style={{ width: `${Math.min(100, (row.usage / 2000) * 100)}%` }}
            />
          </div>
          <span className="text-xs text-slate-600 dark:text-white w-8 shrink-0">
            {row.usage}
          </span>
        </div>
      ),
    },
    {
      key: "isActive",
      label: t("common.status"),
      render: (row) => (
        <Badge
          className={`px-2 py-1 rounded text-xs font-semibold ${
            row.isActive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {row.isActive ? t("catalog.active") : t("catalog.inactive")}
        </Badge>
      ),
    },
    {
      key: "startDate",
      label: t("discounts.startDate"),
      width: "140px",
      render: (row) => <span className="text-xs">{row.startDate}</span>,
    },
    {
      key: "endDate",
      label: t("discounts.endDate"),
      width: "140px",
      render: (row) => <span className="text-xs">{row.endDate}</span>,
    },
    {
      key: "actions",
      label: t("common.actions"),
      sortable: false,
      width: "150px",
      render: (row) => (
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            className="h-8 w-8 p-2! flex items-center justify-center rounded-[5px] border border-slate-200 text-blue-600 hover:bg-blue-50 transition"
            onClick={() => {
              setSi(row);
              setOd("view");
            }}
          >
            <Eye style={{ width: 16, height: 16 }} />
          </Button>
          {canUpdate && (
            <Button
              variant="outline"
              onClick={() => {
                setSi(row);
                setForm({
                  name: row.name,
                  code: row.code,
                  type: row.type,
                  value:
                    row._raw?.value ?? row.discount?.replace("%", "") ?? "",
                  isActive: row.isActive,
                  startsAt: row._raw?.startsAt
                    ? new Date(row._raw.startsAt).toISOString().slice(0, 10)
                    : "",
                  expiresAt: row._raw?.expiresAt
                    ? new Date(row._raw.expiresAt).toISOString().slice(0, 10)
                    : "",
                });
                setOd("edit");
              }}
              className="h-8 w-8 p-2! flex items-center justify-center rounded-[5px] border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition"
            >
              <Edit style={{ width: 16, height: 16 }} />
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outline"
              className="h-8 w-8 p-2! flex items-center justify-center rounded-[5px] border border-slate-200 text-rose-600 hover:bg-rose-50 transition"
              onClick={() => {
                setSi(row);
                setOd("delete");
              }}
            >
              <Trash2 style={{ width: 16, height: 16 }} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {dynamicStats.map((item) => (
          <SummaryCard
            key={item.label}
            label={item.label}
            value={item.value}
            icon={item.icon}
            color="from-amber-500 to-orange-500"
          />
        ))}
      </div>

      <Card className="p-6">
        <TableToolbar
          title={t("discounts.discountCampaigns")}
          onAddNew={canCreate ? () => navigate("/discounts/create") : null}
          onRefresh={async () => {
            setLoading(true);
            try {
              const data = await discountService.getDiscountsAdmin();
              setItems(
                (Array.isArray(data) ? data : []).map(normalizeDiscount),
              );
            } catch {
              setItems([]);
            } finally {
              setLoading(false);
            }
          }}
          onExportCsv={dt.handleExport}
          search={search}
          searchPlaceholder={t("catalog.searchPlaceholder")}
          filterOptions={[
            { key: "type", label: t("common.type"), values: types },
          ]}
          activeFilters={activeFilters}
          onFilterChange={(key, val) =>
            setActiveFilters((p) => ({ ...p, [key]: val }))
          }
        />

        {dt.viewMode === "list" ? (
          <DataTable
            columns={columns}
            rows={dt.paginated}
            keyField="id"
            loading={loading}
            emptyMessage={t("discounts.noResults")}
            sortField={dt.sortField}
            sortDir={dt.sortDir}
            onSort={dt.toggleSort}
            checkedIds={dt.checkedIds}
            onToggleRow={dt.toggleRow}
            onToggleAll={dt.toggleAll}
            allChecked={dt.allChecked}
            someChecked={dt.someChecked}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin text-amber-500 border-4 border-current border-t-transparent rounded-full" />
              </div>
            ) : dt.paginated.length === 0 ? (
              <div className="col-span-full text-center py-8 text-sm text-slate-500 dark:text-white">
                {t("discounts.noResults")}
              </div>
            ) : (
              dt.paginated.map((item) => (
                <div
                  key={item.id}
                  className="border border-slate-200 rounded-2xl p-4 hover:shadow-lg transition cursor-pointer"
                  onClick={() => {
                    setSi(item);
                    setOd("view");
                  }}
                >
                  <div className="font-title text-base font-semibold mb-1">
                    {item.name}
                  </div>
                  <div className="text-xs mb-3 font-mono">{item.code}</div>
                  <div className="text-lg font-bold text-emerald-600 mb-3">
                    {item.discount}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className="mb-0">
                      {item.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-blue-600 hover:bg-blue-50 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSi(item);
                          setOd("view");
                        }}
                      >
                        <Eye style={{ width: 16, height: 16 }} />
                      </Button>
                      {canUpdate && (
                        <Button
                          variant="outline"
                          className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSi(item);
                            setForm({
                              name: item.name,
                              code: item.code,
                              type: item.type,
                              value:
                                item._raw?.value ??
                                item.discount?.replace("%", "") ??
                                "",
                              isActive: item.isActive,
                              startsAt: item._raw?.startsAt
                                ? new Date(item._raw.startsAt)
                                    .toISOString()
                                    .slice(0, 10)
                                : "",
                              expiresAt: item._raw?.expiresAt
                                ? new Date(item._raw.expiresAt)
                                    .toISOString()
                                    .slice(0, 10)
                                : "",
                            });
                            setOd("edit");
                          }}
                        >
                          <Edit style={{ width: 16, height: 16 }} />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSi(item);
                            setOd("delete");
                          }}
                          className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 style={{ width: 16, height: 16 }} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <TablePagination
          currentPage={dt.currentPage}
          totalPages={dt.totalPages}
          totalItems={dt.totalItems}
          pageSize={20}
          onPage={dt.setPage}
        />
      </Card>

      {/* Dialogs */}
      {od && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setOd(null)}
        >
          <div
            className="rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 bg-(--color-background) border-(--color-secondary)"
            onClick={(e) => e.stopPropagation()}
          >
            {od === "view" && (
              <>
                <h2 className="font-title text-xl font-bold mb-4">
                  {t("discounts.campaignDetail")}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ["name", t("common.name")],
                    ["code", t("discounts.code")],
                    ["type", t("common.type")],
                    ["discount", t("discounts.discount")],
                    ["usage", t("discounts.usage")],
                  ].map(([k, label]) => (
                    <div key={k}>
                      <span className="text-[10px] uppercase font-bold">
                        {t(label)}
                      </span>
                      <div className="text-sm font-medium mt-0.5">
                        {si?.[k]}
                      </div>
                    </div>
                  ))}
                  <div>
                    <span className="text-[10px] uppercase font-bold">
                      {t("common.status")}
                    </span>
                    <div
                      className={`text-sm font-medium mt-0.5 ${si?.isActive ? "text-emerald-600" : "text-rose-500"}`}
                    >
                      {si?.isActive ? "Active" : "Inactive"}
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full mt-6 px-3 py-2"
                  onClick={() => setOd(null)}
                >
                  {t("catalog.close")}
                </Button>
              </>
            )}

            {od === "edit" && (
              <>
                <h2 className="font-title text-xl font-bold mb-4">
                  {t("discounts.editCampaign")}
                </h2>
                <div className="space-y-3">
                  {[
                    ["name", "text", t("common.name"), "campaign-name"],
                    ["code", "text", t("discounts.code"), "campaign-code"],
                    [
                      "value",
                      "number",
                      t("discounts.discount"),
                      "discount-val",
                    ],
                  ].map(([field, type, label, id]) => (
                    <div key={field}>
                      <Label htmlFor={id} className="text-sm mb-1 block">
                        {label}
                      </Label>
                      <Input
                        id={id}
                        type={type}
                        value={form[field] ?? ""}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, [field]: e.target.value }))
                        }
                      />
                    </div>
                  ))}
                  <div>
                    <Label className="text-sm mb-1 block">
                      {t("common.type")}
                    </Label>
                    <Select
                      value={form.type ?? ""}
                      onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("discounts.selectType")} />
                      </SelectTrigger>
                      <SelectContent className="bg-(--color-background)">
                        <SelectItem value="PERCENT">
                          {t("discounts.percentage")}
                        </SelectItem>
                        <SelectItem value="FIXED">
                          {t("discounts.fixed")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm mb-1 block">
                      {t("common.status")}
                    </Label>
                    <Select
                      value={form.isActive ? "ACTIVE" : "INACTIVE"}
                      onValueChange={(v) =>
                        setForm((p) => ({ ...p, isActive: v === "ACTIVE" }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-(--color-background)">
                        <SelectItem value="ACTIVE" className="">
                          {t("discount.active")}
                        </SelectItem>
                        <SelectItem value="INACTIVE" className="">
                          {t("discount.inactive")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {[
                    ["startsAt", t("discounts.startDate")],
                    ["expiresAt", t("discounts.endDate")],
                  ].map(([field, label]) => (
                    <div key={field}>
                      <Label className="text-sm mb-1 block">{label}</Label>
                      <Input
                        type="date"
                        value={form[field] ?? ""}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, [field]: e.target.value }))
                        }
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-5">
                  <Button
                    variant="secondary"
                    className="flex-1 px-3 py-2"
                    onClick={() => setOd(null)}
                    disabled={saving}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    className="flex-1 px-3 py-2"
                    disabled={saving}
                    onClick={async () => {
                      if (!si?.slug) return;
                      setSaving(true);
                      try {
                        const payload = {
                          name: form.name,
                          code: form.code,
                          type: form.type,
                          value:
                            form.value !== ""
                              ? parseFloat(form.value)
                              : undefined,
                          isActive: form.isActive,
                          startsAt: form.startsAt || null,
                          expiresAt: form.expiresAt || null,
                        };
                        const res = await discountService.updateDiscount(
                          si.slug,
                          payload,
                        );
                        const updated = normalizeDiscount(
                          res || { ...si, ...payload },
                          0,
                        );
                        setItems((prev) =>
                          prev.map((x) =>
                            x.id === si.id ? { ...x, ...updated } : x,
                          ),
                        );
                        toastTopRight(
                          "success",
                          t("discounts.editSuccess", "Campaign updated!"),
                        );
                        setOd(null);
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    {saving ? t("common.saving") : t("common.save")}
                  </Button>
                </div>
              </>
            )}

            {od === "delete" && (
              <>
                <h2 className="font-title text-xl font-bold mb-4">
                  {t("discounts.deleteCampaign")}
                </h2>
                <p className="text-sm text-slate-600 dark:text-white mb-5">
                  {t("discounts.deleteConfirm", { name: si?.name })}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setOd(null)}
                    disabled={saving}
                  >
                    {saving ? t("common.canceling") : t("common.cancel")}
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={saving}
                    onClick={async () => {
                      if (!si?.slug) return;
                      setSaving(true);
                      try {
                        await discountService.deleteDiscount(si.slug);
                        setItems((prev) => prev.filter((x) => x.id !== si.id));
                        setOd(null);
                      } catch {
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    {saving ? t("common.deleting") : t("common.delete")}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default DiscountsPage;
