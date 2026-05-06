import { useEffect, useMemo, useState } from "react";
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

const generateMockModels = () => {
  const statuses = ["Published", "Draft", "Review"];
  const models = [];
  for (let i = 1; i <= 45; i++) {
    models.push({
      id: i,
      name: `Model ${i}`,
      category: ["Electronics", "Furniture", "Accessories"][i % 3],
      status: statuses[i % 3],
      views: Math.floor(Math.random() * 10000),
      created: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      ).toLocaleDateString(),
      creator: `User ${(i % 5) + 1}`,
    });
  }
  return models;
};

const ModelsPage = () => {
  const [models] = useState(generateMockModels());
  const [viewMode, setViewMode] = useState("table");
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    category: null,
    status: null,
  });
  const itemsPerPage = 20;
  const search = useExpandableSearch();
  const debouncedSearch = useDebounce(search.value, 300);
  const dialogRef = useClickOutsideClose(() => setOpenDialog(null));
  const filterRef = useClickOutsideClose(() => setFilterOpen(false));

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedFilters]);

  const filteredModels = useMemo(
    () =>
      models.filter((m) => {
        const s =
          debouncedSearch === "" ||
          m.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          m.category.toLowerCase().includes(debouncedSearch.toLowerCase());
        return (
          s &&
          (selectedFilters.category === null ||
            m.category === selectedFilters.category) &&
          (selectedFilters.status === null ||
            m.status === selectedFilters.status)
        );
      }),
    [models, debouncedSearch, selectedFilters],
  );

  const totalPages = Math.ceil(filteredModels.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedModels = filteredModels.slice(
    startIdx,
    startIdx + itemsPerPage,
  );
  const handleView = (m) => {
    setSelectedModel(m);
    setOpenDialog("view");
  };
  const handleEdit = (m) => {
    setSelectedModel(m);
    setOpenDialog("edit");
  };
  const handleDelete = (m) => {
    setSelectedModel(m);
    setOpenDialog("delete");
  };
  const categories = ["Electronics", "Furniture", "Accessories"];
  const statuses = ["Published", "Draft", "Review"];

  return (
    <section className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-title text-2xl font-bold text-slate-950">
              3D Models
            </h1>
            <Button className="h-8 w-8 p-0 rounded-lg" onClick={() => {}}>
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-2 flex-1">
              <div
                ref={search.containerRef}
                className="flex items-center gap-2"
              >
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
                  variant={filterOpen ? "default" : "ghost"}
                  className="h-10 w-10 p-0"
                  onClick={() => setFilterOpen(!filterOpen)}
                >
                  <Filter className="h-5 w-5" />
                </Button>
                {filterOpen && (
                  <div
                    ref={filterRef}
                    className="absolute top-full mt-2 right-0 bg-white border border-slate-200 rounded-2xl shadow-lg p-4 w-64 z-10"
                  >
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs font-semibold text-slate-900 mb-2">
                          Category
                        </div>
                        {categories.map((cat) => (
                          <label
                            key={cat}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedFilters.category === cat}
                              onChange={() =>
                                setSelectedFilters((p) => ({
                                  ...p,
                                  category: p.category === cat ? null : cat,
                                }))
                              }
                              className="rounded"
                            />
                            <span className="text-sm text-slate-600">
                              {cat}
                            </span>
                          </label>
                        ))}
                      </div>
                      <div className="border-t border-slate-200 pt-4">
                        <div className="text-xs font-semibold text-slate-900 mb-2">
                          Status
                        </div>
                        {statuses.map((st) => (
                          <label
                            key={st}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedFilters.status === st}
                              onChange={() =>
                                setSelectedFilters((p) => ({
                                  ...p,
                                  status: p.status === st ? null : st,
                                }))
                              }
                              className="rounded"
                            />
                            <span className="text-sm text-slate-600">{st}</span>
                          </label>
                        ))}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          setSelectedFilters({ category: null, status: null })
                        }
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {viewMode === "table" && (
          <div
            className="overflow-x-auto"
            style={{ maxHeight: "calc(100vh - 300px)" }}
          >
            <div className="min-w-[800px]">
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_150px] gap-4 bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.2em] font-bold text-slate-900 border-b border-slate-300 sticky top-0 z-10">
                  <div>Name</div>
                  <div>Category</div>
                  <div>Status</div>
                  <div>Views</div>
                  <div>Actions</div>
                </div>
                <div
                  className="overflow-y-auto"
                  style={{ maxHeight: "calc(100vh - 380px)" }}
                >
                  {paginatedModels.length === 0 ? (
                    <div className="px-4 py-8 text-sm text-slate-500 text-center">
                      No models found
                    </div>
                  ) : (
                    paginatedModels.map((m) => (
                      <div
                        key={m.id}
                        className="grid grid-cols-[2fr_1fr_1fr_1fr_150px] gap-4 border-b border-slate-200 px-4 py-4 text-sm text-slate-600"
                      >
                        <div>
                          <div className="font-title text-base font-semibold text-slate-900">
                            {m.name}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            By {m.creator} • {m.created}
                          </div>
                        </div>
                        <div>{m.category}</div>
                        <div>
                          <Badge>{m.status}</Badge>
                        </div>
                        <div>{m.views.toLocaleString()}</div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleView(m)}
                            className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-blue-600 hover:bg-blue-50 transition"
                            style={{ padding: 5 }}
                          >
                            <Eye style={{ width: 18, height: 18 }} />
                          </button>
                          <button
                            onClick={() => handleEdit(m)}
                            className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition"
                            style={{ padding: 5 }}
                          >
                            <Edit style={{ width: 18, height: 18 }} />
                          </button>
                          <button
                            onClick={() => handleDelete(m)}
                            className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-rose-600 hover:bg-rose-50 transition"
                            style={{ padding: 5 }}
                          >
                            <Trash2 style={{ width: 18, height: 18 }} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedModels.length === 0 ? (
              <div className="col-span-full text-center py-8 text-sm text-slate-500">
                No models found
              </div>
            ) : (
              paginatedModels.map((m) => (
                <div
                  key={m.id}
                  className="border border-slate-200 rounded-2xl p-4 hover:shadow-lg transition"
                >
                  <div className="bg-slate-100 h-40 rounded-xl mb-4 flex items-center justify-center">
                    <span className="text-slate-400">Model Preview</span>
                  </div>
                  <div className="font-title text-base font-semibold text-slate-900 mb-1">
                    {m.name}
                  </div>
                  <div className="text-xs text-slate-500 mb-3">
                    {m.category} • {m.views.toLocaleString()} views
                  </div>
                  <Badge className="mb-3">{m.status}</Badge>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 gap-2 text-slate-600"
                      onClick={() => handleView(m)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 gap-2 text-emerald-600"
                      onClick={() => handleEdit(m)}
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 gap-2 text-rose-600"
                      onClick={() => handleDelete(m)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
          <div className="text-sm text-slate-600">
            Showing {startIdx + 1}-
            {Math.min(startIdx + itemsPerPage, filteredModels.length)} of{" "}
            {filteredModels.length} models
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p;
                if (totalPages <= 5) p = i + 1;
                else if (currentPage <= 3) p = i + 1;
                else if (currentPage >= totalPages - 2) p = totalPages - 4 + i;
                else p = currentPage - 2 + i;
                return (
                  <Button
                    key={p}
                    variant={currentPage === p ? "default" : "ghost"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {openDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div
            ref={dialogRef}
            className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4"
          >
            {openDialog === "view" && (
              <>
                <h2 className="font-title text-xl font-bold text-slate-900 mb-4">
                  View Model
                </h2>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-slate-500 uppercase">Name</div>
                    <div className="text-sm text-slate-900">
                      {selectedModel?.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase">
                      Category
                    </div>
                    <div className="text-sm text-slate-900">
                      {selectedModel?.category}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase">
                      Status
                    </div>
                    <Badge>{selectedModel?.status}</Badge>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase">
                      Views
                    </div>
                    <div className="text-sm text-slate-900">
                      {selectedModel?.views.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase">
                      Created
                    </div>
                    <div className="text-sm text-slate-900">
                      {selectedModel?.created}
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full mt-6"
                  onClick={() => setOpenDialog(null)}
                >
                  Close
                </Button>
              </>
            )}
            {openDialog === "edit" && (
              <>
                <h2 className="font-title text-xl font-bold text-slate-900 mb-4">
                  Edit Model
                </h2>
                <p className="text-sm text-slate-600">
                  Edit coming soon for: <strong>{selectedModel?.name}</strong>
                </p>
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setOpenDialog(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setOpenDialog(null)}
                  >
                    Save
                  </Button>
                </div>
              </>
            )}
            {openDialog === "delete" && (
              <>
                <h2 className="font-title text-xl font-bold text-slate-900 mb-4">
                  Delete Model
                </h2>
                <p className="text-sm text-slate-600 mb-4">
                  Are you sure you want to delete{" "}
                  <strong>{selectedModel?.name}</strong>? This action cannot be
                  undone.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setOpenDialog(null)}
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

export default ModelsPage;
