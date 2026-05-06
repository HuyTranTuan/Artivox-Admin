import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Eye,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import { useClickOutsideClose } from "@hooks/useClickOutsideClose";
import { useDebounce } from "@hooks/useDebounce";
import { useExpandableSearch } from "@hooks/useExpandableSearch";
import { collectionService } from "@services/collectionService";

const CollectionPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fo, setFo] = useState(false);
  const [cp, setCp] = useState(1);
  const [sf, setSf] = useState({ status: null });
  const search = useExpandableSearch();
  const pp = 20;
  const ds = useDebounce(search.value, 300);
  const fr = useClickOutsideClose(() => setFo(false));

  // Fetch collections from API
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await collectionService.getCollections();
        if (mounted) setItems(Array.isArray(data) ? data : []);
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

  useEffect(() => {
    setCp(1);
  }, [ds, sf]);

  // Filter collections based on search
  const f = useMemo(
    () =>
      items.filter((m) => {
        const s =
          ds === "" ||
          m.name?.toLowerCase().includes(ds.toLowerCase()) ||
          m.description?.toLowerCase().includes(ds.toLowerCase());
        return s && (!sf.status || m.status === sf.status);
      }),
    [items, ds, sf],
  );
  const tp = Math.ceil(f.length / pp);
  const si2 = (cp - 1) * pp;
  const pg = f.slice(si2, si2 + pp);

  return (
    <section className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-title text-2xl font-bold text-slate-950">
              Collections
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
          </div>
        </div>

        {/* Table */}
        <div
          className="overflow-x-auto"
          style={{ maxHeight: "calc(100vh - 300px)" }}
        >
          <div className="min-w-[700px]">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-[2fr_1fr_2fr_120px] gap-4 bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.2em] font-bold text-slate-900 border-b border-slate-300 sticky top-0 z-10">
                <div>Name</div>
                <div>Slug</div>
                <div>Description</div>
                <div>Actions</div>
              </div>
              <div
                className="overflow-y-auto"
                style={{ maxHeight: "calc(100vh - 380px)" }}
              >
                {loading ? (
                  <div className="px-4 py-8 text-sm text-slate-500 text-center">
                    Loading collections...
                  </div>
                ) : pg.length === 0 ? (
                  <div className="px-4 py-8 text-sm text-slate-500 text-center">
                    No collections found
                  </div>
                ) : (
                  pg.map((m) => (
                    <div
                      key={m.id || m.slug}
                      className="grid grid-cols-[2fr_1fr_2fr_120px] gap-4 border-b border-slate-200 px-4 py-4 text-sm text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                      onClick={() =>
                        navigate(`/products/collections/${m.slug}`)
                      }
                    >
                      <div>
                        <div className="font-title text-base font-semibold text-slate-900">
                          {m.name}
                        </div>
                      </div>
                      <div className="text-slate-500 font-mono text-xs self-center">
                        {m.slug}
                      </div>
                      <div className="text-xs text-slate-500 truncate self-center">
                        {m.description || "—"}
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/products/collections/${m.slug}`);
                          }}
                          className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-blue-600 hover:bg-blue-50 transition"
                          style={{ padding: 5 }}
                        >
                          <Eye style={{ width: 18, height: 18 }} />
                        </button>
                      </div>
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
            Showing {si2 + 1}-{Math.min(si2 + pp, f.length)} of {f.length}
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
    </section>
  );
};

export default CollectionPage;
