import { useTranslation } from "@/hooks/useTranslation";
import { useState, useMemo, useCallback } from "react";
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  Download,
  LayoutGrid,
  LayoutList,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  PackageSearch,
} from "lucide-react";

import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { exportToCsv } from "@utils/exportCsv";
import { useClickOutsideClose } from "@hooks/useClickOutsideClose";

export const TableToolbar = ({
  title,
  onAddNew,
  onRefresh,
  onExportCsv,
  filterOptions = [],
  activeFilters = {},
  onFilterChange,
  viewMode = "list",
  onViewChange = null,
  search = null,
  searchPlaceholder,
}) => {
  const { t } = useTranslation();

  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useClickOutsideClose(() => setFilterOpen(false));
  const hasActiveFilter = Object.values(activeFilters).some(Boolean);

  return (
    <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: title + add */}
      <div className="flex items-center gap-3">
        <h2 className="font-title text-xl font-bold">{title}</h2>
        {onAddNew && (
          <Button
            variant="outline-orange"
            className="gap-1.5 rounded-lg px-3 h-9 text-sm font-semibold "
            onClick={onAddNew}
          >
            <Plus className="h-4 w-4" />
            {t("catalog.addNew")}
          </Button>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5">
        {/* Export CSV */}
        <Button
          variant="outline"
          className="gap-1.5 h-9 px-3 text-sm border-green-600 text-green-600 hover:bg-white "
          onClick={onExportCsv}
          title="Export CSV"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">{t("csv")}</span>
        </Button>

        {/* Refresh */}
        <Button
          variant="ghost"
          className="h-9 w-9 p-0! "
          onClick={onRefresh}
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>

        {/* View toggle */}
        {onViewChange && (
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <Button
              variant="orange"
              className={`h-9 w-9 p-0! flex items-center justify-center transition  ${
                viewMode === "list"
                  ? "bg-slate-950 text-white"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
              onClick={() => onViewChange("list")}
              title="List view"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant="orange"
              className={`h-9 w-9 p-0! flex items-center justify-center transition  ${
                viewMode === "grid"
                  ? "bg-slate-950 text-white"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
              onClick={() => onViewChange("grid")}
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Search */}
        {search && (
          <div ref={search.containerRef} className="flex items-center gap-1.5">
            {search.isOpen && (
              <div className="relative w-52">
                <Input
                  ref={search.inputRef}
                  className="pr-8 h-9"
                  placeholder={searchPlaceholder || t("searchPlaceholder")}
                  value={search.value}
                  onChange={(e) => search.setValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && search.submit()}
                />
                {search.value && (
                  <Button
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 "
                    onClick={search.clear}
                    variant="ghost"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            )}
            <Button
              variant="ghost"
              className="h-9 w-9 p-0! "
              onClick={search.submit}
              title="Search"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Filter */}
        {filterOptions.length > 0 && (
          <div className="relative">
            <Button
              variant={filterOpen || hasActiveFilter ? "default" : "ghost"}
              className="h-9 w-9 p-0! "
              onClick={() => setFilterOpen((v) => !v)}
              title="Filter"
            >
              <Filter className="h-4 w-4" />
            </Button>

            {filterOpen && (
              <div
                ref={filterRef}
                className="absolute top-full mt-2 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 w-60 z-40"
              >
                <div className="space-y-4">
                  {filterOptions.map((opt) => (
                    <div key={opt.key}>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                        {opt.label}
                      </div>
                      <div className="space-y-1">
                        {opt.values.map((val) => (
                          <label
                            key={val}
                            className="flex items-center gap-2  py-0.5"
                          >
                            <input
                              type="checkbox"
                              checked={activeFilters[opt.key] === val}
                              onChange={() =>
                                onFilterChange(
                                  opt.key,
                                  activeFilters[opt.key] === val ? null : val,
                                )
                              }
                              className="rounded accent-orange-600"
                            />
                            <span className="text-sm text-slate-700">
                              {val}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  {hasActiveFilter && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full mt-1 "
                      onClick={() =>
                        filterOptions.forEach((opt) =>
                          onFilterChange(opt.key, null),
                        )
                      }
                    >
                      {t("catalog.clearFilters")}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const TablePagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPage,
}) => {
  const { t } = useTranslation();
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const pages = useMemo(() => {
    const total = Math.max(1, totalPages);
    const arr = [];
    const range = 2; // pages around current
    let start = Math.max(1, currentPage - range);
    let end = Math.min(total, currentPage + range);
    // always show at least 5 pages if possible
    if (end - start < 4) {
      if (start === 1) end = Math.min(total, 5);
      else start = Math.max(1, end - 4);
    }
    for (let p = start; p <= end; p++) arr.push(p);
    return arr;
  }, [currentPage, totalPages]);

  if (totalPages <= 1 && totalItems === 0) return null;

  return (
    <div className="flex items-center justify-between mt-5 pt-5 border-t border-slate-200">
      <div className="text-xs font-semibold">
        {t("common.showing", {
          totalRows: totalItems,
          startPage: currentPage,
          endPage: totalPages,
        })}
      </div>
      <div className="flex gap-1 items-center">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 px-2 text-xs "
          onClick={() => onPage(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          {t("discounts.prev")}
        </Button>

        {pages[0] > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0! text-xs "
              onClick={() => onPage(1)}
            >
              1
            </Button>
            {pages[0] > 2 && (
              <span className="text-slate-400 text-xs px-1">...</span>
            )}
          </>
        )}

        {pages.map((p) => (
          <Button
            key={p}
            variant={currentPage === p ? "default" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0! text-xs "
            onClick={() => onPage(p)}
          >
            {p}
          </Button>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <span className="text-slate-400 text-xs px-1">...</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0! text-xs "
              onClick={() => onPage(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 px-2 text-xs "
          onClick={() => onPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
        >
          {t("catalog.next")}
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
export const EmptyState = ({ message = "No items found." }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
    <PackageSearch className="h-10 w-10 opacity-40" />
    <p className="text-sm">{message}</p>
  </div>
);

const SortIcon = ({ field, sortField, sortDir }) => {
  if (sortField !== field)
    return <ArrowUpDown className="h-3 w-3 opacity-30 shrink-0" />;
  return sortDir === "asc" ? (
    <ArrowUp className="h-3 w-3 text-amber-500 shrink-0" />
  ) : (
    <ArrowDown className="h-3 w-3 text-amber-500 shrink-0" />
  );
};

export const DataTable = ({
  columns = [],
  rows = [],
  keyField = "id",
  loading = false,
  emptyMessage = "No items found.",
  sortField = null,
  sortDir = "asc",
  onSort = null,
  checkedIds = new Set(),
  onToggleRow,
  onToggleAll,
  allChecked = false,
  someChecked = false,
}) => {
  const checkboxColWidth = "36px";
  const { t } = useTranslation();

  const totalFr = useMemo(() => {
    let total = 0;
    columns.forEach((c) => {
      const w = c.width || "1fr";
      if (typeof w === "string" && w.endsWith("fr")) {
        total += parseFloat(w);
      }
    });
    return total;
  }, [columns]);

  const getColStyle = (width) => {
    if (!width) return { minWidth: "120px" };
    const w = String(width);
    if (w.endsWith("px")) {
      return { width: w, minWidth: w };
    }
    if (w.endsWith("fr")) {
      const val = parseFloat(w);
      const pct = totalFr > 0 ? (val / totalFr) * 100 : 0;
      return { width: `${pct}%`, minWidth: "120px" };
    }
    return { width: w };
  };

  const minTableWidth = useMemo(() => {
    let width = 36;
    columns.forEach((c) => {
      const w = String(c.width || "1fr");
      if (w.endsWith("px")) {
        width += parseFloat(w);
      } else if (w.endsWith("fr")) {
        width += parseFloat(w) * 120;
      } else {
        width += 120;
      }
    });
    return Math.max(800, width);
  }, [columns]);

  return (
    <div className="w-full">
      {/* selection hint */}
      {checkedIds.size > 0 && (
        <div className="mb-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-medium">
          {checkedIds.size}{" "}
          {checkedIds.size > 1 ? t("common.rows") : t("common.row")}{" "}
          {t("common.selected")}
        </div>
      )}

      <div
        className="overflow-auto rounded-2xl border border-slate-200 bg-white"
        style={{ maxHeight: "calc(100vh - 340px)" }}
      >
        <table
          className="w-full border-collapse text-left table-fixed"
          style={{ minWidth: `${minTableWidth}px` }}
        >
          <colgroup>
            <col
              style={{ width: checkboxColWidth, minWidth: checkboxColWidth }}
            />
            {columns.map((col) => (
              <col key={col.key} style={getColStyle(col.width || "1fr")} />
            ))}
          </colgroup>
          <thead>
            <tr className="text-[10px] uppercase tracking-widest font-bold border-b border-slate-200">
              <th
                style={{ width: checkboxColWidth, minWidth: checkboxColWidth }}
                className="px-4 py-3 whitespace-nowrap align-middle sticky top-0 bg-slate-200 z-10"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => {
                      if (el) el.indeterminate = someChecked;
                    }}
                    onChange={onToggleAll}
                    className="rounded accent-orange-600 "
                  />
                </div>
              </th>
              {columns.map((col) => {
                const isSortable =
                  col.sortable !== false && col.key !== "actions";
                return (
                  <th
                    key={col.key}
                    style={getColStyle(col.width || "1fr")}
                    className={`px-4 py-3 whitespace-nowrap align-middle sticky top-0 bg-slate-200 z-10 ${isSortable ? " select-none text-slate-800 hover:text-slate-900" : ""} ${col.headerClass || ""}`}
                    onClick={() => isSortable && onSort?.(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {isSortable && onSort && (
                        <SortIcon
                          field={col.key}
                          sortField={sortField}
                          sortDir={sortDir}
                        />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-10 text-center font-semibold"
                >
                  {t("common.loading")}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1}>
                  <EmptyState message={emptyMessage} />
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => {
                const id = row[keyField];
                const isChecked = checkedIds.has(id);
                return (
                  <tr
                    key={id ?? idx}
                    className={`transition-colors bg-slate-50/50 align-middle font-semibold text-slate-800 ${
                      idx % 2 === 1 ? "bg-slate-50/50" : "bg-white"
                    }`}
                  >
                    <td
                      style={{
                        width: checkboxColWidth,
                        minWidth: checkboxColWidth,
                      }}
                      className="px-4 py-3 align-middle"
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggleRow?.(id)}
                          className="rounded accent-orange-600 "
                        />
                      </div>
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        style={getColStyle(col.width || "1fr")}
                        className={`px-4 py-3 align-middle font-semibold ${
                          col.className || ""
                        }`}
                      >
                        {col.render
                          ? col.render(row, idx)
                          : (row[col.key] ?? "-")}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export function useDataTable({
  rows = [],
  keyField = "id",
  pageSize = 20,
  exportFilename = "export",
  onExportRow = null,
} = {}) {
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [viewMode, setViewMode] = useState("list");
  const [currentPage, setCurrentPage] = useState(1);

  const toggleSort = useCallback((field) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return field;
      }
      setSortDir("asc");
      return field;
    });
    setCurrentPage(1);
  }, []);

  const sorted = useMemo(() => {
    if (!sortField) return rows;
    return [...rows].sort((a, b) => {
      const va = a[sortField];
      const vb = b[sortField];
      if (va == null && vb == null) return 0;
      if (va == null) return sortDir === "asc" ? 1 : -1;
      if (vb == null) return sortDir === "asc" ? -1 : 1;
      if (typeof va === "number" && typeof vb === "number")
        return sortDir === "asc" ? va - vb : vb - va;
      return sortDir === "asc"
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
  }, [rows, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = sorted.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const toggleAll = useCallback(() => {
    setCheckedIds((prev) => {
      if (prev.size === paginated.length && paginated.length > 0)
        return new Set();
      return new Set(paginated.map((r) => r[keyField]));
    });
  }, [paginated, keyField]);

  const toggleRow = useCallback((id) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleExport = useCallback(() => {
    const target =
      checkedIds.size > 0
        ? sorted.filter((r) => checkedIds.has(r[keyField]))
        : sorted;
    const mapped = onExportRow ? target.map(onExportRow) : target;
    exportToCsv(mapped, exportFilename);
  }, [sorted, checkedIds, keyField, onExportRow, exportFilename]);

  const allChecked =
    paginated.length > 0 && checkedIds.size === paginated.length;
  const someChecked = checkedIds.size > 0 && checkedIds.size < paginated.length;

  const setPage = useCallback((p) => setCurrentPage(p), []);

  return {
    // data
    sorted,
    paginated,
    totalItems: sorted.length,
    // pagination
    currentPage: safePage,
    totalPages,
    setPage,
    pageSize,
    // sort
    sortField,
    sortDir,
    toggleSort,
    // checkbox
    checkedIds,
    toggleRow,
    toggleAll,
    allChecked,
    someChecked,
    // view
    viewMode,
    setViewMode,
    // export
    handleExport,
  };
}
