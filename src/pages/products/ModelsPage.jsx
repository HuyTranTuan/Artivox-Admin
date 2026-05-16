import { useMemo, useState, useRef, useEffect } from "react";
import { Eye, Edit, Trash2, Grid3x3, List, Search, Filter, ChevronLeft, ChevronRight, X, Plus, ImageIcon, Upload, GripVertical, Loader2 } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { useClickOutsideClose } from "@hooks/useClickOutsideClose";
import { useDebounce } from "@hooks/useDebounce";
import { useExpandableSearch } from "@hooks/useExpandableSearch";
import { usePaginatedApi } from "@hooks/usePaginatedApi";
import { modelsService } from "@services/modelsService";
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

const ModelsPage = () => {
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
  } = usePaginatedApi((params) => modelsService.getModels({ search: ds || undefined, ...params }), { defaultLimit: 20, pageParam: "page" });
  const [vm, setVm] = useState("table");
  const [fo, setFo] = useState(false);
  const [od, setOd] = useState(null);
  const [si, setSi] = useState(null);
  const [sf, setSf] = useState({ category: null, status: null });
  const [form, setForm] = useState({
    name: "",
    category: "",
    status: "Published",
  });
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [formThumbnail, setFormThumbnail] = useState(null);
  const [formImages, setFormImages] = useState([]);
  const [formThumbnailPreview, setFormThumbnailPreview] = useState(null);
  const thumbnailInputRef = useRef(null);
  const detailImageInputRef = useRef(null);
  const search = useExpandableSearch();
  const ds = useDebounce(search.value, 300);
  const dr = useClickOutsideClose(() => setOd(null));
  const fr = useClickOutsideClose(() => setFo(false));

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setPage(1);
  }, [ds]);

  const openGallery = (images, index = 0) => {
    setGalleryImages(images || []);
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  const cats = [...new Set(items.map((m) => m.category).filter(Boolean))];
  const sts = [...new Set(items.map((m) => m.status).filter(Boolean))];

  const f = useMemo(
    () =>
      items.filter((m) => {
        return (!sf.category || m.category === sf.category) && (!sf.status || m.status === sf.status);
      }),
    [items, sf],
  );

  const pg = f;
  const si2 = 0;

  const resetForm = () => {
    setForm({ name: "", category: "", status: "Published" });
    setFormThumbnail(null);
    setFormImages([]);
    setFormThumbnailPreview(null);
  };

  const handleCreate = () => {
    resetForm();
    setSi(null);
    setOd("create");
  };

  const handleEdit = (item) => {
    setSi(item);
    setOd("edit");
    setForm({ name: item.name, category: item.category, status: item.status });
    setFormThumbnail(null);
    setFormThumbnailPreview(item.images?.[0]?.thumb || item.images?.[0]?.url || null);
    setFormImages(item.images || []);
  };

  const handleSubmit = () => setOd(null);

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormThumbnail(file);
    setFormThumbnailPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleDetailImageAdd = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newImages = files.map((file, idx) => ({
      url: URL.createObjectURL(file),
      thumb: URL.createObjectURL(file),
      alt: `Image ${formImages.length + idx + 1}`,
      _file: file,
    }));
    setFormImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  const removeFormImage = (idx) => {
    setFormImages((prev) => prev.filter((_, i) => i !== idx));
  };

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
        onClick={() => handleEdit(item)}
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
      <div ref={dr} className="bg-white rounded-2xl shadow-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="font-title text-xl font-bold text-slate-900 mb-4">{od === "create" ? "Add New Model" : "Edit Model"}</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Name</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none"
            >
              <option value="">Select category</option>
              <option>Electronics</option>
              <option>Furniture</option>
              <option>Accessories</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none"
            >
              <option>Published</option>
              <option>Draft</option>
              <option>Review</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Thumbnail</label>
            <div className="flex items-center gap-3">
              <div
                onClick={() => thumbnailInputRef.current?.click()}
                className="h-20 w-20 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition overflow-hidden"
              >
                {formThumbnailPreview ? (
                  <img src={formThumbnailPreview} alt="thumbnail" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Upload className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400">Upload</span>
                  </div>
                )}
              </div>
              <input ref={thumbnailInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
              <div className="text-xs text-slate-400">
                <p>Click to upload</p>
                <p>Recommended 150x150</p>
              </div>
              {formThumbnailPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setFormThumbnail(null);
                    setFormThumbnailPreview(null);
                  }}
                  className="text-rose-500 hover:text-rose-700 text-xs font-semibold"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Detail Images ({formImages.length})</label>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-2">
              {formImages.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">No images added yet</div>
              ) : (
                formImages.map((img, idx) => {
                  const src = img?.thumb || img?.url || img;
                  return (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 rounded-lg px-2 py-1.5">
                      <GripVertical className="h-4 w-4 text-slate-300 shrink-0 cursor-grab" />
                      <img
                        src={typeof src === "string" ? src : ""}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <span className="flex-1 text-xs text-slate-600 truncate">{img.alt || `Image ${idx + 1}`}</span>
                      <button type="button" onClick={() => removeFormImage(idx)} className="text-rose-500 hover:text-rose-700 shrink-0">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
            <input ref={detailImageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleDetailImageAdd} />
            <Button type="button" variant="ghost" size="sm" className="mt-2 gap-1.5 text-xs" onClick={() => detailImageInputRef.current?.click()}>
              <Plus className="h-3.5 w-3.5" />
              Add Images
            </Button>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" className="flex-1" onClick={() => setOd(null)}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSubmit}>
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
            <div className="text-rose-500 font-semibold mb-2">Failed to load models</div>
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
            <h1 className="font-title text-2xl font-bold text-slate-950">3D Models</h1>
            <Button className="gap-2 rounded-lg px-4 py-2 h-auto text-sm font-semibold" onClick={handleCreate}>
              <Plus className="h-5 w-5" /> Add New
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div ref={search.containerRef} className="flex items-center gap-2">
              {search.isOpen ? (
                <div className="relative w-64">
                  <Input
                    ref={search.inputRef}
                    className="pl-4 pr-10"
                    placeholder="Search models..."
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
                      <div className="text-xs font-semibold text-slate-900 mb-2">Category</div>
                      {cats.map((c) => (
                        <label key={c} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={sf.category === c} onChange={() => setSf((p) => ({ ...p, category: p.category === c ? null : c }))} className="rounded" />
                          <span className="text-sm text-slate-600">{c}</span>
                        </label>
                      ))}
                    </div>
                    <div className="border-t border-slate-200 pt-4">
                      <div className="text-xs font-semibold text-slate-900 mb-2">Status</div>
                      {sts.map((s) => (
                        <label key={s} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={sf.status === s} onChange={() => setSf((p) => ({ ...p, status: p.status === s ? null : s }))} className="rounded" />
                          <span className="text-sm text-slate-600">{s}</span>
                        </label>
                      ))}
                    </div>
                    <Button variant="secondary" size="sm" className="w-full" onClick={() => setSf({ category: null, status: null })}>
                      Clear Filters
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
            <span className="ml-3 text-sm text-slate-500">Loading models...</span>
          </div>
        ) : (
          <>
            {vm === "table" && (
              <div className="overflow-x-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
                <div className="min-w-[900px]">
                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <div className="grid grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_150px] gap-4 bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.2em] font-bold text-slate-900 border-b border-slate-300 sticky top-0 z-10">
                      <div>Image</div>
                      <div>Name</div>
                      <div>Category</div>
                      <div>Status</div>
                      <div>Created At</div>
                      <div>Author</div>
                      <div>Actions</div>
                    </div>
                    <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 380px)" }}>
                      {pg.length === 0 ? (
                        <div className="px-4 py-8 text-sm text-slate-500 text-center">No models found</div>
                      ) : (
                        pg.map((m) => (
                          <div key={m.id} className="grid grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_150px] gap-4 border-b border-slate-200 px-4 py-3 text-sm text-slate-600 items-center">
                            <ThumbnailPreview images={m.images} onClick={() => openGallery(m.images)} />
                            <div>
                              <div className="font-title text-base font-semibold text-slate-900">{m.name}</div>
                            </div>
                            <div>{m.category}</div>
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
                {pg.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-sm text-slate-500">No models found</div>
                ) : (
                  pg.map((m) => (
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
                                <ImageIcon className="h-4 w-4" /> View Gallery ({m.images.length})
                              </div>
                            </div>
                            {m.images.length > 1 && (
                              <div className="absolute top-2 right-2 flex gap-1">
                                {m.images.slice(0, 3).map((_, idx) => (
                                  <div key={idx} className="h-2 w-2 rounded-full bg-white/80" />
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <div className="text-center text-slate-400">
                              <ImageIcon className="h-10 w-10 mx-auto mb-2" />
                              <span className="text-xs">No images</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="font-title text-base font-semibold text-slate-900 mb-1">{m.name}</div>
                        <div className="text-xs text-slate-500 mb-3">
                          {m.category} • Created {fmtDate(m.createdAt)}
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge className="mb-0">{m.status}</Badge>
                          <div className="flex gap-1">
                            <ActionBtns item={m} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
                  <ChevronLeft className="h-4 w-4" /> Previous
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
            <h2 className="font-title text-xl font-bold text-slate-900 mb-4">View Model</h2>
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
                <div className="text-xs text-slate-500 uppercase">Name</div>
                <div className="text-sm text-slate-900">{si.name}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase">Category</div>
                <div className="text-sm text-slate-900">{si.category}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase">Status</div>
                <Badge>{si.status}</Badge>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase">Created</div>
                <div className="text-sm text-slate-900">{fmtDate(si.createdAt)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase">Author</div>
                <div className="text-sm text-slate-900">{si.author || "—"}</div>
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
            <h2 className="font-title text-xl font-bold text-slate-900 mb-4">Delete Model</h2>
            <p className="text-sm text-slate-600 mb-4">
              Are you sure you want to delete <strong>{si.name}</strong>?
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

export default ModelsPage;
