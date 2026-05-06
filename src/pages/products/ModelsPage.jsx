import { useState, useMemo } from "react";
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
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { useClickOutsideClose } from "@hooks/useClickOutsideClose";
import { useDebounce } from "@hooks/useDebounce";

// Mock data - replace with API call
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // "table" or "grid"
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    category: null,
    status: null,
  });

  const itemsPerPage = 20;
  const debouncedSearch = useDebounce(searchQuery, 300);
  const dialogRef = useClickOutsideClose(() => setOpenDialog(null));
  const filterRef = useClickOutsideClose(() => setFilterOpen(false));

  // Filter and search
  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      const matchesSearch =
        debouncedSearch === "" ||
        model.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        model.category.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesCategory =
        selectedFilters.category === null ||
        model.category === selectedFilters.category;

      const matchesStatus =
        selectedFilters.status === null ||
        model.status === selectedFilters.status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [models, debouncedSearch, selectedFilters]);

  // Pagination
  const totalPages = Math.ceil(filteredModels.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedModels = filteredModels.slice(
    startIdx,
    startIdx + itemsPerPage,
  );

  const handleView = (model) => {
    setSelectedModel(model);
    setOpenDialog("view");
  };

  const handleEdit = (model) => {
    setSelectedModel(model);
    setOpenDialog("edit");
  };

  const handleDelete = (model) => {
    setSelectedModel(model);
    setOpenDialog("delete");
  };

  const categories = ["Electronics", "Furniture", "Accessories"];
  const statuses = ["Published", "Draft", "Review"];

  return (
    <section className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="font-title text-sm font-semibold uppercase tracking-[0.24em] text-amber-500">
              Product Management
            </div>
            <h1 className="font-title mt-3 text-3xl font-bold text-slate-950">
              3D Models
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Browse and manage all 3D models in your product catalog.
            </p>
          </div>
          <Button className="gap-2">
            <span>New Model</span>
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        {/* Controls */}
        <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 flex-1">
            {/* Search */}
            {searchOpen ? (
              <div className="relative flex-1">
                <Input
                  className="pl-4"
                  placeholder="Search models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <Button
                  variant="ghost"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="h-10 w-10 p-0"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>
            )}

            {/* Filter */}
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
                      <div className="space-y-2">
                        {categories.map((cat) => (
                          <label
                            key={cat}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedFilters.category === cat}
                              onChange={() =>
                                setSelectedFilters((prev) => ({
                                  ...prev,
                                  category: prev.category === cat ? null : cat,
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
                    </div>

                    <div className="border-t border-slate-200 pt-4">
                      <div className="text-xs font-semibold text-slate-900 mb-2">
                        Status
                      </div>
                      <div className="space-y-2">
                        {statuses.map((status) => (
                          <label
                            key={status}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedFilters.status === status}
                              onChange={() =>
                                setSelectedFilters((prev) => ({
                                  ...prev,
                                  status:
                                    prev.status === status ? null : status,
                                }))
                              }
                              className="rounded"
                            />
                            <span className="text-sm text-slate-600">
                              {status}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setSelectedFilters({ category: null, status: null });
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
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

        {/* Table View */}
        {viewMode === "table" && (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_120px] gap-4 bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-500 border-b border-slate-300">
              <div>Name</div>
              <div>Category</div>
              <div>Status</div>
              <div>Views</div>
              <div>Actions</div>
            </div>

            {paginatedModels.length === 0 ? (
              <div className="px-4 py-8 text-sm text-slate-500 text-center">
                No models found
              </div>
            ) : (
              paginatedModels.map((model) => (
                <div
                  key={model.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_120px] gap-4 border-b border-slate-200 px-4 py-4 text-sm text-slate-600"
                >
                  <div>
                    <div className="font-title text-base font-semibold text-slate-900">
                      {model.name}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      By {model.creator} • {model.created}
                    </div>
                  </div>
                  <div>{model.category}</div>
                  <div>
                    <Badge>{model.status}</Badge>
                  </div>
                  <div>{model.views.toLocaleString()}</div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"
                      onClick={() => handleView(model)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700"
                      onClick={() => handleEdit(model)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700"
                      onClick={() => handleDelete(model)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedModels.length === 0 ? (
              <div className="col-span-full text-center py-8 text-sm text-slate-500">
                No models found
              </div>
            ) : (
              paginatedModels.map((model) => (
                <div
                  key={model.id}
                  className="border border-slate-200 rounded-2xl p-4 hover:shadow-lg transition"
                >
                  <div className="bg-slate-100 h-40 rounded-xl mb-4 flex items-center justify-center">
                    <span className="text-slate-400">Model Preview</span>
                  </div>
                  <div className="font-title text-base font-semibold text-slate-900 mb-1">
                    {model.name}
                  </div>
                  <div className="text-xs text-slate-500 mb-3">
                    {model.category} • {model.views.toLocaleString()} views
                  </div>
                  <Badge className="mb-3">{model.status}</Badge>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 gap-2 text-slate-600"
                      onClick={() => handleView(model)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 gap-2 text-emerald-600"
                      onClick={() => handleEdit(model)}
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 gap-2 text-rose-600"
                      onClick={() => handleDelete(model)}
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

        {/* Pagination */}
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
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "ghost"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
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

      {/* Dialogs */}
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
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Edit functionality coming soon for:{" "}
                    <strong>{selectedModel?.name}</strong>
                  </p>
                </div>
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
