import { useMemo, useState, useEffect } from "react";
import { Eye, Edit, Trash2, Grid3x3, List, Search, Filter, ChevronLeft, ChevronRight, X, Plus, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { useClickOutsideClose } from "@hooks/useClickOutsideClose";
import { useDebounce } from "@hooks/useDebounce";
import { useExpandableSearch } from "@hooks/useExpandableSearch";
import { usePaginatedApi } from "@hooks/usePaginatedApi";
import { materialsService } from "@services/materialsService";
import ImageGalleryModal from "@components/ui/ImageGalleryModal";

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

const MaterialsPage = () => {
  const {
    data: items,
    loading,
    error,
    page: cp,
    totalPages: tp,
    totalItems: total,
    setPage,
    nextPage,
    prevPage,
    refetch,
  } = usePaginatedApi((params) => materialsService.getMaterials({ ...params }), { defaultLimit: 20, pageParam: "page" });
  const [vm, setVm] = useState("table");
  const [fo, setFo] = useState(false);
  const [od, setOd] = useState(null);
  const [si, setSi] = useState(null);
  const [sf, setSf] = useState({ type: null, status: null });
  const [form, setForm] = useState({ name: "", type: "", status: "Active", stock: "", price: "" });
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const search = useExpandableSearch();
  const ds = useDebounce(search.value, 300);
  const dr = useClickOutsideClose(() => setOd(null));
  const fr = useClickOutsideClose(() => setFo(false));

  useEffect(() => {
    setPage(1);
  }, [ds]);

  const openGallery = (images, index = 0) => {
    setGalleryImages(images || []);
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  const types = [...new Set(items.map((m) => m.type).filter(Boolean))];
  const sts = [...new Set(items.map((m) => m.status).filter(Boolean))];

  const f = useMemo(() => items.filter((m) => (!sf.type || m.type === sf.type) && (!sf.status || m.status === sf.status)), [items, sf]);
  const pg = f;

  const resetForm = () => setForm({ name: "", type: "", status: "Active", stock: "", price: "" });

  const ActionBtns = ({ item }) => (
    <div className="flex gap-1.5">
      <button
        onClick={() => {
          setSi(item);
          setOd("view");
        }}
        className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 transition"
        style={{ padding: 5 }}
      >
        <Eye style={{ width: 18, height: 18 }} />
      </button>
      <button
        onClick={() => {
          setSi(item);
          setOd("edit");
          setForm({ name: item.name, type: item.type, status: item.status, stock: String(item.stock ?? ""), price: String(item.price ?? "") });
        }}
        className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition"
        style={{ padding: 5 }}
      >
        <Edit style={{ width: 18, height: 18 }} />
      </button>
      <button
        onClick={() => {
          setSi(item);
          setOd("delete");
        }}
        className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 transition"
        style={{ padding: 5 }}
      >
        <Trash2 style={{ width: 18, height: 18 }} />
      </button>
    </div>
  );

  const ThumbnailPreview = ({ images, onClick }) => {
    if (!images || images.length === 0) {
      return (
        <div onClick={onClick} className="h-16 w-16 rounded-lg bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition border border-slate-200">
          <ImageIcon className="h-5 w-5 text-slate-400" />
        </div>
      );
    }
    const firstImg = images[0];
    const imgSrc = typeof firstImg === "string" ? firstImg : firstImg?.thumb || firstImg?.url;
    return (
      <div className="relative group" onClick={onClick}>
        <img
          src={imgSrc}
          alt="thumbnail"
          className="h-16 w-16 rounded-lg object-cover cursor-pointer border border-slate-200 hover:border-amber-300 transition hover:shadow-md"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
        {images.length > 1 && (
          <span className="absolute -bottom-1.5 -right-1.5 bg-amber-500 text-white text-[9px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow">
            +{images.length - 1}
          </span>
        )}
      </div>
    );
  };

  const FormModal = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div ref={dr} className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="font-title text-xl font-bold text-slate-900 mb-4">{od === "create" ? "Add New Material" : "Edit Material"}</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Name</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
              <option value="">Select type</option>
              <option>PLA</option>
              <option>ABS</option>
              <option>Resin</option>
              <option>TPU</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
              <option>Active</option>
              <option>Inactive</option>
              <option>Discontinued</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Stock</label>
              <Input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Price (VND)</label>
              <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" className="flex-1" onClick={() => setOd(null)}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={() => setOd(null)}>
            {od === "create" ? "Create" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <section className="space-y-6">
        <Card className="p-6">
          <div className="text-center py-8">
            <div className="text-rose-500 font-semibold mb-2">Failed to load materials</div>
            <div className="text-sm text-slate-500 mb-4">{error}</div>
            <Button onClick={refetch}>Retry</Button>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-title text-2xl font-bold text-slate-950">Materials</h1>
            <Button
              className="gap-2 rounded-lg px-4 py-2 h-auto text-sm font-semibold"
              onClick={() => {
                resetForm();
                setSi(null);
                setOd("create");
              }}
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
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700" onClick={search.clear}>
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              ) : null}
              <Button variant="ghost" className="h-10 w-10 p-0" onClick={search.submit}>
                <Search style={{ width: 18, height: 18 }} />
              </Button>
            </div>
            <div className="relative">
              <Button variant={fo ? "default" : "ghost"} className="h-10 w-10 p-0" onClick={() => setFo(!fo)}>
                <Filter className="h-5 w-5" />
              </Button>
              {fo && (
                <div ref={fr} className="absolute top-full mt-2 right-0 bg-white border border-slate-200 rounded-2xl shadow-lg p-4 w-64 z-10">
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-semibold text-slate-900 mb-2">Type</div>
                      {types.map((t) => (
                        <label key={t} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={sf.type === t} onChange={() => setSf((p) => ({ ...p, type: p.type === t ? null : t }))} className="rounded" />
                          <span className="text-sm">{t}</span>
                        </label>
                      ))}
                    </div>
                    <div className="border-t pt-4">
                      <div className="text-xs font-semibold text-slate-900 mb-2">Status</div>
                      {sts.map((s) => (
                        <label key={s} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={sf.status === s} onChange={() => setSf((p) => ({ ...p, status: p.status === s ? null : s }))} className="rounded" />
                          <span className="text-sm">{s}</span>
                        </label>
                      ))}
                    </div>
                    <Button variant="secondary" size="sm" className="w-full" onClick={() => setSf({ type: null, status: null })}>
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              <Button variant={vm === "table" ? "default" : "ghost"} size="sm" className="h-8 w-8 p-0" onClick={() => setVm("table")}>
                <List className="h-4 w-4" />
              </Button>
              <Button variant={vm === "grid" ? "default" : "ghost"} size="sm" className="h-8 w-8 p-0" onClick={() => setVm("grid")}>
                <Grid3x3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <span className="ml-3 text-sm text-slate-500">Loading materials...</span>
          </div>
        ) : (
          <>
            {vm === "table" && (
              <div className="overflow-x-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
                <div className="min-w-[800px]">
                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <div className="grid grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_120px] gap-4 bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.2em] font-bold text-slate-900 border-b border-slate-300 sticky top-0 z-10">
                      <div>Image</div>
                      <div>Name</div>
                      <div>Type</div>
                      <div>Status</div>
                      <div>Created At</div>
                      <div>Author</div>
                      <div>Actions</div>
                    </div>
                    <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 380px)" }}>
                      {pg.length === 0 ? (
                        <div className="px-4 py-8 text-sm text-slate-500 text-center">No materials found</div>
                      ) : (
                        pg.map((m) => (
                          <div key={m.id} className="grid grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_120px] gap-4 border-b border-slate-200 px-4 py-3 text-sm text-slate-600 items-center">
                            <ThumbnailPreview images={m.images} onClick={() => openGallery(m.images)} />
                            <div className="font-title text-base font-semibold text-slate-900">{m.name}</div>
                            <div>{m.type}</div>
                            <div>
                              <Badge>{m.status}</Badge>
                            </div>
                            <div className="text-xs text-slate-500">{fmtDate(m.createdAt)}</div>
                            <div className="text-xs text-slate-500">{m.author || "—"}</div>
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
                  <div key={m.id} className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition group">
                    <div className="relative h-48 bg-slate-100 cursor-pointer overflow-hidden" onClick={() => openGallery(m.images)}>
                      {m.images && m.images.length > 0 ? (
                        <>
                          <img
                            src={m.images[0].url}
                            alt={m.name}
                            className="h-full w-full object-cover transition group-hover:scale-105"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-2 bg-white/90 rounded-full px-4 py-2 text-sm font-semibold text-slate-800">
                              <ImageIcon className="h-4 w-4" />
                              View Gallery ({m.images.length})
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-400">
                          <div className="text-center">
                            <ImageIcon className="h-10 w-10 mx-auto mb-2" />
                            <span className="text-xs">No images</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="font-title text-base font-semibold text-slate-900 mb-1">{m.name}</div>
                      <div className="text-xs text-slate-500 mb-3">
                        {m.type} • Created {fmtDate(m.createdAt)}
                      </div>
                      <Badge className="mb-3">{m.status}</Badge>
                      <div className="flex gap-2 mt-2">
                        <ActionBtns item={m} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                {total > 0 ? (
                  <>
                    Page {cp} of {tp} ({total} total)
                  </>
                ) : (
                  "No results"
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={prevPage} disabled={cp === 1 || loading}>
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
                      <Button key={p} variant={cp === p ? "default" : "ghost"} size="sm" className="h-8 w-8 p-0" onClick={() => setPage(p)} disabled={loading}>
                        {p}
                      </Button>
                    );
                  })}
                </div>
                <Button variant="ghost" size="sm" onClick={nextPage} disabled={cp === tp || loading}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {od === "create" || od === "edit" ? <FormModal /> : null}
      {od === "view" && si && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div ref={dr} className="bg-white rounded-2xl shadow-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="font-title text-xl font-bold text-slate-900 mb-4">Material Detail</h2>
            {si.images && si.images.length > 0 && (
              <div className="mb-4">
                <div className="relative h-48 rounded-xl overflow-hidden bg-slate-100 cursor-pointer group" onClick={() => openGallery(si.images)}>
                  <img
                    src={si.images[0].url}
                    alt={si.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition text-white font-semibold bg-black/50 rounded-lg px-4 py-2">View all {si.images.length} images</div>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-500 uppercase">Name</span>
                <div className="text-sm">{si.name}</div>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase">Type</span>
                <div className="text-sm">{si.type}</div>
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
                <div className="text-sm">{si.price ? `₫${Number(si.price).toLocaleString()}` : "—"}</div>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase">Created</span>
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
          <div ref={dr} className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="font-title text-xl font-bold mb-4">Delete Material</h2>
            <p className="text-sm text-slate-600 mb-4">
              Delete <strong>{si.name}</strong>?
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setOd(null)}>
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1" onClick={() => setOd(null)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
      {galleryOpen && <ImageGalleryModal images={galleryImages} initialIndex={galleryIndex} onClose={() => setGalleryOpen(false)} />}
    </section>
  );
};

export default MaterialsPage;
