import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Percent,
  Gift,
  Clock,
} from "lucide-react";
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
import { Switch } from "@components/ui/switch";
import { Label } from "@components/ui/label";
import { discountService } from "@services/discountService";
import useToast from "@hooks/useToast";
import { useClickOutsideClose } from "@hooks/useClickOutsideClose";
import { useDebounce } from "@hooks/useDebounce";
import { useExpandableSearch } from "@hooks/useExpandableSearch";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "@hooks/useTranslation";
import SummaryCard from "@/components/SummaryCard";

// Stats are calculated dynamically inside the component
const formatDateLabel = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US");
};

const normalizeDiscount = (rawItem, index) => {
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
    (percentValue !== undefined && percentValue !== null
      ? `${percentValue}%`
      : amountValue !== undefined && amountValue !== null
        ? `${amountValue}`
        : "—");

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
    products: rawItem?.products,
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
  const [fo, setFo] = useState(false);
  const [cp, setCp] = useState(1);
  const [od, setOd] = useState(null);
  const [si, setSi] = useState(null);
  const [sf, setSf] = useState({ type: null, status: null });
  const search = useExpandableSearch();
  const pp = 20;
  const ds = useDebounce(search.value, 300);
  const fr = useClickOutsideClose(() => setFo(false));
  const { toastTopRight } = useToast();

  const { t } = useTranslation();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  // Edit form state (separate from display state `si`)
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  // Parse permission safely
  const permission = useMemo(() => {
    if (isAdmin) return { create: true, update: true, del: true };

    const validJsonString = user?.permission
      .replace(/([a-zA-Z0-9_]+)(?=\s*:)/g, '"$1"')
      .replace(/'/g, '"');

    try {
      const parsed = JSON.parse(validJsonString);
      return {
        create: parsed?.create || false,
        update: parsed?.update || false,
        del: parsed?.del || false,
      };
    } catch {
      return { create: false, update: false, del: false };
    }
  }, [user, isAdmin]);

  const canCreate = permission.create;
  const canUpdate = permission.update;
  const canDelete = permission.del;

  useEffect(() => {
    let mounted = true;
    const loadDiscounts = async () => {
      setLoading(true);
      try {
        const data = await discountService.getDiscountsAdmin();
        const normalized = (Array.isArray(data) ? data : []).map(
          normalizeDiscount,
        );
        if (mounted) setItems(normalized);
      } catch {
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadDiscounts();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setCp(1);
  }, [ds, sf]);

  const types = useMemo(
    () => [...new Set(items.map((item) => item.type).filter(Boolean))],
    [items],
  );
  const sts = useMemo(
    () => [...new Set(items.map((item) => item.status).filter(Boolean))],
    [items],
  );
  // Filter campaigns based on search and filters
  const f = useMemo(
    () =>
      items.filter((m) => {
        const s = ds === "" || m.name.toLowerCase().includes(ds.toLowerCase());
        return (
          s &&
          (!sf.type || m.type === sf.type) &&
          (!sf.status || m.status === sf.status)
        );
      }),
    [items, ds, sf],
  );
  const tp = Math.max(1, Math.ceil(f.length / pp));
  const si2 = (cp - 1) * pp;
  const pg = f.slice(si2, si2 + pp);
  const showingFrom = f.length === 0 ? 0 : si2 + 1;
  const showingTo = Math.min(si2 + pp, f.length);

  const handleView = async (item) => {
    setSi(item);
    setOd("view");

    if (!item.slug) return;

    try {
      const detail = await discountService.getDiscountBySlug(item.slug);
      setSi((prev) => ({
        ...(prev || {}),
        ...normalizeDiscount(detail, 0),
      }));
    } catch {
      // Keep current list item data if detail request fails.
    }
  };

  // Action buttons following the standard: h-8 w-8, rounded-[5px], border, 5px padding, 18px icons
  const ActionBtns = ({ item }) => (
    <div className="flex gap-1.5">
      <button
        onClick={() => handleView(item)}
        className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-blue-600 hover:bg-blue-50 transition"
        style={{ padding: 5 }}
      >
        <Eye style={{ width: 18, height: 18 }} />
      </button>
      {canUpdate && (
        <button
          onClick={() => {
            setSi(item);
            setForm({
              name: item.name,
              code: item.code,
              type: item.type,
              value: item._raw?.value ?? item.discount?.replace("%", "") ?? "",
              isActive: item.isActive,
              startsAt: item._raw?.startsAt
                ? new Date(item._raw.startsAt).toISOString().slice(0, 10)
                : "",
              expiresAt: item._raw?.expiresAt
                ? new Date(item._raw.expiresAt).toISOString().slice(0, 10)
                : "",
            });
            setOd("edit");
          }}
          className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition"
          style={{ padding: 5 }}
        >
          <Edit style={{ width: 18, height: 18 }} />
        </button>
      )}
      {canDelete && (
        <button
          onClick={() => {
            setSi(item);
            setOd("delete");
          }}
          className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-rose-600 hover:bg-rose-50 transition"
          style={{ padding: 5 }}
        >
          <Trash2 style={{ width: 18, height: 18 }} />
        </button>
      )}
    </div>
  );

  const dynamicStats = useMemo(() => {
    const active = items.filter((i) => i.isActive === true).length;
    const totalRedeemed = items.reduce(
      (acc, i) => acc + (Number(i.usage) || 0),
      0,
    );
    const percentItems = items.filter((i) => String(i.discount).includes("%"));
    const avgDiscount = percentItems.length
      ? Math.round(
          percentItems.reduce((acc, i) => acc + parseInt(i.discount), 0) /
            percentItems.length,
        )
      : 0;

    return [
      {
        label: t("discounts.activeCampaigns"),
        value: active.toString(),
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

  return (
    <section className="space-y-6">
      {/* Horizontal Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {dynamicStats.map((item) => {
          return (
            <SummaryCard
              key={item.label}
              label={item.label}
              value={item.value}
              icon={item.icon}
              color="from-amber-500 to-orange-500"
            />
          );
        })}
      </div>

      <Card className="p-6">
        {/* Header: title + search/filter/new */}
        <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-title text-2xl font-bold text-slate-950">
              {t("discounts.discountCampaigns")}
            </h1>
            <Button
              variant="outline-orange"
              className="gap-2 rounded-lg px-4 py-2 h-auto text-sm font-semibold"
              onClick={() => navigate("/discounts/create")}
              disabled={!canCreate}
            >
              <Plus className="h-5 w-5" /> {t("discounts.addNew")}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div ref={search.containerRef} className="flex items-center gap-2">
              {search.isOpen ? (
                <div className="relative w-64">
                  <Input
                    ref={search.inputRef}
                    className="pr-10"
                    placeholder={t("catalog.searchPlaceholder")}
                    value={search.value}
                    onChange={(e) => search.setValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") search.submit();
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
              <Button
                variant="ghost"
                className="h-10 w-10 p-0!"
                onClick={search.submit}
              >
                <Search style={{ width: 18, height: 18 }} />
              </Button>
            </div>
            <div className="relative">
              <Button
                variant={fo ? "default" : "ghost"}
                className="h-10 w-10 p-0!"
                onClick={() => setFo(!fo)}
              >
                <Filter className="h-5 w-5" />
              </Button>
              {fo && (
                <div
                  ref={fr}
                  className="absolute top-full mt-2 right-0 bg-white border border-slate-200 rounded-2xl shadow-lg p-4 w-64 z-40"
                >
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-semibold text-slate-900 mb-2">
                        {t("discounts.type")}
                      </div>
                      {types.map((typeVal) => (
                        <label
                          key={typeVal}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={sf.type === t}
                            onChange={() =>
                              setSf((p) => ({
                                ...p,
                                type: p.type === typeVal ? null : typeVal,
                              }))
                            }
                            className="rounded"
                          />
                          <span className="text-sm">{typeVal}</span>
                        </label>
                      ))}
                    </div>
                    <div className="border-t pt-4">
                      <div className="text-xs font-semibold text-slate-900 mb-2">
                        {t("discounts.status")}
                      </div>
                      {sts.map((s) => (
                        <label
                          key={s}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={sf.status === s}
                            onChange={() =>
                              setSf((p) => ({
                                ...p,
                                status: p.status === s ? null : s,
                              }))
                            }
                            className="rounded"
                          />
                          <span className="text-sm">{s}</span>
                        </label>
                      ))}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => setSf({ type: null, status: null })}
                    >
                      {t("discounts.clear")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table View */}
        <div
          className="overflow-x-auto"
          style={{ maxHeight: "calc(100vh - 340px)" }}
        >
          <div className="min-w-[800px]">
            <div className="rounded-2xl border border-slate-200">
              <div className="grid grid-cols-[200px_2fr_1fr_1fr_1fr_1fr_120px_120px_120px] gap-4 bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.2em] font-bold text-slate-900 border-b border-slate-300 sticky top-0 z-10">
                <div>{t("discounts.name")}</div>
                <div>{t("discounts.code")}</div>
                <div>{t("discounts.type")}</div>
                <div>{t("discounts.discount")}</div>
                <div>{t("discounts.usage")}</div>
                <div>{t("discounts.status")}</div>
                <div>{t("discounts.startDate")}</div>
                <div>{t("discounts.endDate")}</div>
                <div>{t("discounts.actions")}</div>
              </div>

              <div style={{ maxHeight: "calc(100vh - 420px)" }}>
                {loading ? (
                  <div className="px-4 py-8 text-sm text-slate-700 text-center">
                    {t("discounts.loading")}
                  </div>
                ) : pg.length === 0 ? (
                  <div className="px-4 py-8 text-sm text-slate-700 text-center">
                    {t("discounts.noResults")}
                  </div>
                ) : (
                  pg.map((m, idx) => (
                    <div
                      key={m.id}
                      className={`grid grid-cols-[200px_2fr_1fr_1fr_1fr_1fr_120px_120px_120px] gap-4 border-b border-slate-200 px-4 py-4 text-sm text-slate-700 transition ${idx % 2 === 1 ? "bg-slate-100" : "bg-white"} hover:bg-orange-100`}
                    >
                      <div>
                        <div className="font-title text-base font-semibold text-slate-900">
                          {m.name}
                        </div>
                      </div>
                      <div>
                        <div className="font-title text-base font-semibold text-slate-900">
                          {m.code}
                        </div>
                      </div>
                      <div className="font-title text-base font-semibold text-slate-900">
                        {m.type}
                      </div>
                      <div className="font-semibold text-emerald-600">
                        {m.discount}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-slate-950 rounded-full"
                              style={{
                                width: `${Math.min(100, (m.usage / 2000) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-slate-700">
                            {m.usage}
                          </span>
                        </div>
                      </div>
                      <div>
                        <Badge>{m.isActive ? "Active" : "Inactive"}</Badge>
                      </div>
                      <div className="text-xs text-slate-700">
                        {m.startDate}
                      </div>
                      <div className="text-xs text-slate-700">{m.endDate}</div>
                      <ActionBtns item={m} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
          <div className="text-sm text-slate-700">
            {t("discounts.showing", {
              from: showingFrom,
              to: showingTo,
              total: f.length,
            })}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCp(Math.max(1, cp - 1))}
              disabled={cp === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              {t("discounts.prev")}
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, tp) }, (_, i) => {
                let p;
                if (tp <= 5) p = i + 1;
                else if (cp <= 3) p = i + 1;
                else if (cp >= tp - 2) p = tp - 4 + i;
                else p = cp - 2 + i;
                return (
                  <Button
                    key={p}
                    variant={cp === p ? "default" : "ghost"}
                    size="sm"
                    className="h-8 w-8 p-0!"
                    onClick={() => setCp(p)}
                  >
                    {p}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCp(Math.min(tp, cp + 1))}
              disabled={cp === tp}
            >
              {t("discounts.next")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* CRUD Dialogs */}
      {od && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
            {od === "view" && (
              <>
                <h2 className="font-title text-xl font-bold text-slate-900 mb-4">
                  {t("discounts.campaignDetail")}
                </h2>
                <div className="space-y-3 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-700 uppercase">
                      {t("discounts.name")}
                    </span>
                    <div className="text-sm font-medium text-slate-500 max-w-40 text-ellipsis overflow-hidden whitespace-nowrap">
                      {si?.name}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-700 uppercase">
                      {t("discounts.code")}
                    </span>
                    <div className="text-sm font-medium text-slate-900 max-w-20 text-ellipsis overflow-hidden">
                      {si?.code}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-700 uppercase">
                      {t("discounts.type")}
                    </span>
                    <div className="text-sm text-slate-500">{si?.type}</div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-700 uppercase">
                      {t("discounts.discount")}
                    </span>
                    <div className="text-sm text-slate-500">{si?.discount}</div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-700 uppercase">
                      {t("discounts.usage")}
                    </span>
                    <div className="text-sm text-slate-500">{si?.usage}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-700 uppercase">
                      {t("discounts.status")}
                    </div>
                    <div
                      className={
                        si?.isActive ? "text-green-500" : "text-red-500"
                      }
                    >
                      {si?.isActive ? "Active" : "Inactive"}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-700 uppercase">
                      {t("discounts.period")}
                    </span>
                    <div className="text-sm text-slate-500">
                      {si?.startDate} → {si?.endDate}
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full mt-6 cursor-pointer"
                  onClick={() => setOd(null)}
                >
                  {t("catalog.close")}
                </Button>
              </>
            )}
            {od === "edit" && (
              <>
                <h2 className="font-title text-xl font-bold mb-4 text-slate-800">
                  {t("discounts.editCampaign")}
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="campaign-name"
                      className="text-sm text-slate-500 mb-1 block"
                    >
                      {t("discounts.name")}
                    </Label>
                    <Input
                      id="campaign-name"
                      value={form.name ?? ""}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="campaign-code"
                      className="text-sm text-slate-500 mb-1 block"
                    >
                      {t("discounts.code")}
                    </Label>
                    <Input
                      id="campaign-code"
                      value={form.code ?? ""}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, code: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="discount-type"
                      className="text-sm text-slate-500 mb-1 block"
                    >
                      {t("discounts.type")}
                    </Label>
                    <Select
                      value={form.type ?? ""}
                      onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("discounts.selectType")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENT">
                          {t("discounts.percentage")}
                        </SelectItem>
                        <SelectItem value="FIXED">
                          {t("discounts.fixedAmount")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label
                      htmlFor="discount-value"
                      className="text-sm text-slate-500 mb-1 block"
                    >
                      {t("discounts.discount")}
                    </Label>
                    <Input
                      id="discount-value"
                      type="number"
                      value={form.value ?? ""}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, value: e.target.value }))
                      }
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Label
                      htmlFor="discount-status"
                      className="text-sm text-slate-500"
                    >
                      {t("discounts.status")}
                    </Label>
                    <Select
                      id="discount-status"
                      value={form.isActive ? "ACTIVE" : "INACTIVE"}
                      onValueChange={(value) =>
                        setForm((p) => ({ ...p, isActive: value === "ACTIVE" }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("discounts.selectStatus")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">
                          {t("discounts.active")}
                        </SelectItem>
                        <SelectItem value="INACTIVE">
                          {t("discounts.inactive")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label
                      htmlFor="discount-startsAt"
                      className="text-sm text-slate-500 mb-1 block"
                    >
                      {t("discounts.startDate")}
                    </Label>
                    <Input
                      id="discount-startsAt"
                      type="date"
                      value={form.startsAt ?? ""}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, startsAt: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="discount-expiresAt"
                      className="text-sm text-slate-500 mb-1 block"
                    >
                      {t("discounts.endDate")}
                    </Label>
                    <Input
                      id="discount-expiresAt"
                      type="date"
                      value={form.expiresAt ?? ""}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, expiresAt: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setOd(null)}
                    disabled={saving}
                  >
                    {t("discounts.cancel")}
                  </Button>
                  <Button
                    className="flex-1"
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
                        const updatedData = res || { ...si, ...payload };
                        const updated = normalizeDiscount(updatedData, 0);
                        setItems((prev) =>
                          prev.map((x) =>
                            x.id === si.id ? { ...x, ...updated } : x,
                          ),
                        );
                        toastTopRight("success", t("discounts.editSuccess", "Campaign updated successfully!"));
                        setOd(null);
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    {saving ? "Saving…" : t("catalog.save")}
                  </Button>
                </div>
              </>
            )}
            {od === "delete" && (
              <>
                <h2 className="font-title text-xl font-bold mb-4">
                  {t("discounts.deleteCampaign")}
                </h2>
                <p className="text-sm text-slate-700 mb-4">
                  {t("discounts.deleteConfirm", { name: si?.name })}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1 cursor-pointer"
                    onClick={() => setOd(null)}
                    disabled={saving}
                  >
                    {t("discounts.cancel")}
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 cursor-pointer"
                    disabled={saving}
                    onClick={async () => {
                      if (!si?.slug) return;
                      setSaving(true);
                      try {
                        await discountService.deleteDiscount(si.slug);
                        setItems((prev) => prev.filter((x) => x.id !== si.id));
                        setOd(null);
                      } catch {
                        // silent
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    {saving ? "Deleting…" : t("discounts.delete")}
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
