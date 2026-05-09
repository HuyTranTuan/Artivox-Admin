import { useEffect, useMemo, useState } from "react";
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
import { discountService } from "@services/discountService";
import { useClickOutsideClose } from "@hooks/useClickOutsideClose";
import { useDebounce } from "@hooks/useDebounce";
import { useExpandableSearch } from "@hooks/useExpandableSearch";

const stats = [
  { label: "Active campaigns", value: "8", icon: Percent },
  { label: "Total redeemed", value: "3,240", icon: Gift },
  { label: "Avg. discount", value: "22%", icon: Clock },
];
const formatDateLabel = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US");
};

const normalizeDiscount = (rawItem, index) => {
  const id = rawItem?.id || rawItem?._id || rawItem?.slug || `discount-${index}`;
  const slug = rawItem?.slug || rawItem?.code || String(id);
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
    name:
      rawItem?.name ||
      rawItem?.title ||
      rawItem?.campaignName ||
      rawItem?.code ||
      `Discount Campaign ${index + 1}`,
    type: rawItem?.type || rawItem?.discountType || "Unknown",
    status: rawItem?.status || "UNKNOWN",
    discount: String(discountValue),
    usage: Number(rawItem?.usage ?? rawItem?.usedCount ?? rawItem?.redeemedCount ?? 0),
    startDate: formatDateLabel(
      rawItem?.startDate || rawItem?.startAt || rawItem?.createdAt,
    ),
    endDate: formatDateLabel(
      rawItem?.endDate || rawItem?.endAt || rawItem?.expiresAt,
    ),
  };
};

const DiscountCampaignsPage = () => {
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
  const dr = useClickOutsideClose(() => setOd(null));
  const fr = useClickOutsideClose(() => setFo(false));

  useEffect(() => {
    let mounted = true;
    const loadDiscounts = async () => {
      setLoading(true);
      try {
        const data = await discountService.getDiscounts();
        const normalized = (Array.isArray(data) ? data : []).map(normalizeDiscount);
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
      <button
        onClick={() => {
          setSi(item);
          setOd("edit");
        }}
        className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition"
        style={{ padding: 5 }}
      >
        <Edit style={{ width: 18, height: 18 }} />
      </button>
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
    </div>
  );

  return (
    <section className="space-y-6">
      {/* Horizontal Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shrink-0">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-title text-2xl font-bold text-slate-900">
                  {item.value}
                </div>
                <div className="text-xs text-slate-500">{item.label}</div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        {/* Header: title + search/filter/new */}
        <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-title text-2xl font-bold text-slate-950">
              Discount campaigns
            </h1>
            <Button className="h-8 w-8 p-0 rounded-lg">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div ref={search.containerRef} className="flex items-center gap-2">
              {search.isOpen ? (
                <div className="relative w-64">
                  <Input
                    ref={search.inputRef}
                    className="pr-10"
                    placeholder="Search..."
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
                className="h-10 w-10 p-0"
                onClick={search.submit}
              >
                <Search style={{ width: 18, height: 18 }} />
              </Button>
            </div>
            <div className="relative">
              <Button
                variant={fo ? "default" : "ghost"}
                className="h-10 w-10 p-0"
                onClick={() => setFo(!fo)}
              >
                <Filter className="h-5 w-5" />
              </Button>
              {fo && (
                <div
                  ref={fr}
                  className="absolute top-full mt-2 right-0 bg-white border border-slate-200 rounded-2xl shadow-lg p-4 w-64 z-10"
                >
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-semibold text-slate-900 mb-2">
                        Type
                      </div>
                      {types.map((t) => (
                        <label
                          key={t}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={sf.type === t}
                            onChange={() =>
                              setSf((p) => ({
                                ...p,
                                type: p.type === t ? null : t,
                              }))
                            }
                            className="rounded"
                          />
                          <span className="text-sm">{t}</span>
                        </label>
                      ))}
                    </div>
                    <div className="border-t pt-4">
                      <div className="text-xs font-semibold text-slate-900 mb-2">
                        Status
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
                      Clear
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
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_120px] gap-4 bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.2em] font-bold text-slate-900 border-b border-slate-300 sticky top-0 z-10">
                <div>Campaign</div>
                <div>Type</div>
                <div>Discount</div>
                <div>Usage</div>
                <div>Status</div>
                <div>Ends</div>
                <div>Actions</div>
              </div>

              <div
                className="overflow-y-auto"
                style={{ maxHeight: "calc(100vh - 420px)" }}
              >
                {loading ? (
                  <div className="px-4 py-8 text-sm text-slate-500 text-center">
                    Loading campaigns...
                  </div>
                ) : pg.length === 0 ? (
                  <div className="px-4 py-8 text-sm text-slate-500 text-center">
                    No campaigns found
                  </div>
                ) : (
                  pg.map((m, idx) => (
                    <div
                      key={m.id}
                      className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_120px] gap-4 border-b border-slate-200 px-4 py-4 text-sm text-slate-600 transition ${idx % 2 === 1 ? "bg-slate-100" : "bg-white"} hover:bg-orange-100`}
                    >
                      <div>
                        <div className="font-title text-base font-semibold text-slate-900">
                          {m.name}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {m.startDate}
                        </div>
                      </div>
                      <div>
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-slate-100 rounded-md text-slate-700">
                          {m.type}
                        </span>
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
                          <span className="text-xs text-slate-500">
                            {m.usage}
                          </span>
                        </div>
                      </div>
                      <div>
                        <Badge>{m.status}</Badge>
                      </div>
                      <div className="text-xs text-slate-500">{m.endDate}</div>
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
          <div className="text-sm text-slate-600">
            Showing {showingFrom}-{showingTo} of {f.length}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCp(Math.max(1, cp - 1))}
              disabled={cp === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
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
                    className="h-8 w-8 p-0"
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
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* CRUD Dialogs */}
      {od && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div
            ref={dr}
            className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4"
          >
            {od === "view" && (
              <>
                <h2 className="font-title text-xl font-bold text-slate-900 mb-4">
                  Campaign Detail
                </h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-slate-500 uppercase">
                      Name
                    </span>
                    <div className="text-sm font-medium text-slate-900">
                      {si?.name}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 uppercase">
                      Type
                    </span>
                    <div className="text-sm">{si?.type}</div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 uppercase">
                      Discount
                    </span>
                    <div className="text-sm">{si?.discount}</div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 uppercase">
                      Usage
                    </span>
                    <div className="text-sm">{si?.usage}</div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 uppercase">
                      Period
                    </span>
                    <div className="text-sm">
                      {si?.startDate} → {si?.endDate}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 uppercase">
                      Status
                    </span>
                    <Badge>{si?.status}</Badge>
                  </div>
                </div>
                <Button className="w-full mt-6" onClick={() => setOd(null)}>
                  Close
                </Button>
              </>
            )}
            {od === "edit" && (
              <>
                <h2 className="font-title text-xl font-bold mb-4">
                  Edit Campaign
                </h2>
                <p className="text-sm text-slate-600">
                  Edit coming soon for: <strong>{si?.name}</strong>
                </p>
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setOd(null)}
                  >
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={() => setOd(null)}>
                    Save
                  </Button>
                </div>
              </>
            )}
            {od === "delete" && (
              <>
                <h2 className="font-title text-xl font-bold mb-4">
                  Delete Campaign
                </h2>
                <p className="text-sm text-slate-600 mb-4">
                  Delete <strong>{si?.name}</strong>?
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setOd(null)}
                  >
                    Cancel
                  </Button>
                  <Button variant="destructive" className="flex-1">
                    Delete
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

export default DiscountCampaignsPage;
