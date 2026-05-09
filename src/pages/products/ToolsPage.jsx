import { useMemo, useState } from "react";
import {
  Eye,
  Edit,
  Trash2,
  Grid3x3,
  List,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { useClickOutsideClose } from "@hooks/useClickOutsideClose";
import { useDebounce } from "@hooks/useDebounce";
import { useExpandableSearch } from "@hooks/useExpandableSearch";

// format date DD/MM/YYYY
const fmtDate = (d) => {
  if (!d) return "—";
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  } catch {
    return d;
  }
};

// Mock data
const MOCK = Array.from({ length: 28 }, (_, i) => ({
  id: i + 1,
  name: `Tool ${i + 1}`,
  category: ["Cutting", "Printing", "Cleaning", "Measuring"][i % 4],
  status: ["Active", "Inactive", "Maintenance"][i % 3],
  stock: Math.floor(Math.random() * 200),
  price: Math.floor(Math.random() * 5000000) + 50000,
  createdAt: new Date(
    Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000,
  ).toISOString(),
  author: `User ${(i % 6) + 1}`,
}));

const ToolsPage = () => {
  const [items] = useState(MOCK);
  const [vm, setVm] = useState("table");
  const [fo, setFo] = useState(false);
  const [cp, setCp] = useState(1);
  const [od, setOd] = useState(null); // null | "create" | "view" | "edit" | "delete"
  const [si, setSi] = useState(null);
  const [sf, setSf] = useState({ category: null, status: null });
  const [form, setForm] = useState({
    name: "",
    category: "",
    status: "Active",
    stock: "",
    price: "",
  });
  const search = useExpandableSearch();
  const pp = 20;
  const ds = useDebounce(search.value, 300);
  const dr = useClickOutsideClose(() => setOd(null));
  const fr = useClickOutsideClose(() => setFo(false));

  const cats = [...new Set(items.map((m) => m.category).filter(Boolean))];
  const sts = [...new Set(items.map((m) => m.status).filter(Boolean))];

  useMemo(() => setCp(1), [ds, sf]);

  const f = useMemo(
    () =>
      items.filter((m) => {
        const s = ds === "" || m.name?.toLowerCase().includes(ds.toLowerCase());
        return (
          s &&
          (!sf.category || m.category === sf.category) &&
          (!sf.status || m.status === sf.status)
        );
      }),
    [items, ds, sf],
  );

  const tp = Math.ceil(f.length / pp);
  const si2 = (cp - 1) * pp;
  const pg = f.slice(si2, si2 + pp);

  const resetForm = () =>
    setForm({ name: "", category: "", status: "Active", stock: "", price: "" });

  const handleCreate = () => {
    resetForm();
    setSi(null);
    setOd("create");
  };

  const handleSubmit = () => {
    // mock create/edit
    setOd(null);
  };

  const ActionBtns = ({ item }) => (
    <div className="flex gap-1.5">
      <button
        onClick={() => {
          setSi(item);
          setOd("view");
        }}
        className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-blue-600 hover:bg-blue-50 transition"
        style={{ padding: 5 }}
      >
        <Eye style={{ width: 18, height: 18 }} />
      </button>
      <button
        onClick={() => {
          setSi(item);
          setOd("edit");
          setForm({
            name: item.name,
            category: item.category,
            status: item.status,
            stock: String(item.stock ?? ""),
            price: String(item.price ?? ""),
          });
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

  const FormModal = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div
        ref={dr}
        className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4"
      >
        <h2 className="font-title text-xl font-bold text-slate-900 mb-4">
          {od === "create" ? "Add New Tool" : "Edit Tool"}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Category
            </label>
            <Input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            >
              <option>Active</option>
              <option>Inactive</option>
              <option>Maintenance</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Stock
              </label>
              <Input
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Price (VND)
              </label>
              <Input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setOd(null)}
          >
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSubmit}>
            {od === "create" ? "Create" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <section className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-title text-2xl font-bold text-slate-950">
              Tools
            </h1>
            <Button
              className="gap-2 rounded-lg px-4 py-2 h-auto text-sm font-semibold"
              onClick={handleCreate}
            >
              <Plus className="h-5 w-5" /> Add New
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
                        Category
                      </div>
                      {cats.map((c) => (
                        <label
                          key={c}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={sf.category === c}
                            onChange={() =>
                              setSf((p) => ({
                                ...p,
                                category: p.category === c ? null : c,
                              }))
                            }
                            className="rounded"
                          />
                          <span className="text-sm">{c}</span>
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
                      onClick={() => setSf({ category: null, status: null })}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              <Button
                variant={vm === "table" ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setVm("table")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={vm === "grid" ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setVm("grid")}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {vm === "table" && (
          <div
            className="overflow-x-auto"
            style={{ maxHeight: "calc(100vh - 300px)" }}
          >
            <div className="min-w-[700px]">
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_120px] gap-4 bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.2em] font-bold text-slate-900 border-b border-slate-300 sticky top-0 z-10">
                  <div>Name</div>
                  <div>Category</div>
                  <div>Status</div>
                  <div>Created At</div>
                  <div>Author</div>
                  <div>Actions</div>
                </div>
                <div
                  className="overflow-y-auto"
                  style={{ maxHeight: "calc(100vh - 380px)" }}
                >
                  {pg.length === 0 ? (
                    <div className="px-4 py-8 text-sm text-slate-500 text-center">
                      No tools found
                    </div>
                  ) : (
                    pg.map((m) => (
                      <div
                        key={m.id}
                        className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_120px] gap-4 border-b border-slate-200 px-4 py-4 text-sm text-slate-600"
                      >
                        <div className="font-title text-base font-semibold text-slate-900">
                          {m.name}
                        </div>
                        <div>{m.category}</div>
                        <div>
                          <Badge>{m.status}</Badge>
                        </div>
                        <div className="text-xs text-slate-500">
                          {fmtDate(m.createdAt)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {m.author || "—"}
                        </div>
                        <ActionBtns item={m} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {vm === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pg.map((m) => (
              <div
                key={m.id}
                className="border border-slate-200 rounded-2xl p-4 hover:shadow-lg transition"
              >
                <div className="bg-slate-100 h-32 rounded-xl mb-4 flex items-center justify-center text-slate-400">
                  Preview
                </div>
                <div className="font-title text-base font-semibold text-slate-900 mb-1">
                  {m.name}
                </div>
                <div className="text-xs text-slate-500 mb-3">
                  {m.category} • Created {fmtDate(m.createdAt)}
                </div>
                <Badge className="mb-3">{m.status}</Badge>
                <div className="flex gap-2 mt-2">
                  <ActionBtns item={m} />
                </div>
              </div>
            ))}
          </div>
        )}

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
              <ChevronLeft className="h-4 w-4" /> Prev
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
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {od === "create" || od === "edit" ? <FormModal /> : null}

      {od === "view" && si && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div
            ref={dr}
            className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4"
          >
            <h2 className="font-title text-xl font-bold text-slate-900 mb-4">
              Tool Detail
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-500 uppercase">Name</span>
                <div className="text-sm">{si.name}</div>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase">
                  Category
                </span>
                <div className="text-sm">{si.category}</div>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase">Status</span>
                <Badge>{si.status}</Badge>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase">Stock</span>
                <div className="text-sm">{si.stock ?? "—"}</div>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase">Price</span>
                <div className="text-sm">
                  {si.price ? `₫${Number(si.price).toLocaleString()}` : "—"}
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase">
                  Created
                </span>
                <div className="text-sm">{fmtDate(si.createdAt)}</div>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase">Author</span>
                <div className="text-sm">{si.author || "—"}</div>
              </div>
            </div>
            <Button className="w-full mt-6" onClick={() => setOd(null)}>
              Close
            </Button>
          </div>
        </div>
      )}

      {od === "delete" && si && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div
            ref={dr}
            className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4"
          >
            <h2 className="font-title text-xl font-bold mb-4">Delete Tool</h2>
            <p className="text-sm text-slate-600 mb-4">
              Delete <strong>{si.name}</strong>?
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setOd(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => setOd(null)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ToolsPage;
