import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";

export const usePaginatedApi = (fetchFn, options = {}) => {
  const { defaultLimit = 20, defaultPage = 1, pageParam = "page", refreshDeps = [] } = options;
  const [searchParams, setSearchParams] = useSearchParams();

  // Store fetchFn in a ref to avoid infinite re-renders from inline arrow functions
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  // Read page from URL
  const currentPage = Math.max(1, parseInt(searchParams.get(pageParam)) || defaultPage);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(defaultLimit);

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  const setPage = useCallback(
    (page) => {
      const p = Math.max(1, Math.min(page, totalPages || 1));
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (p === 1) next.delete(pageParam);
        else next.set(pageParam, String(p));
        return next;
      });
    },
    [totalPages, setSearchParams, pageParam],
  );

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) setPage(currentPage + 1);
  }, [currentPage, totalPages, setPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) setPage(currentPage - 1);
  }, [currentPage, setPage]);

  const extractData = (result) => {
    // Case 1: Direct array
    if (Array.isArray(result)) {
      return { data: result, total: result.length };
    }

    // Case 2: { data: [...], total: N } or { data: { data: [...] } } (double-wrapped)
    const rawData = result?.data?.data ?? result?.data ?? result;
    if (Array.isArray(rawData)) {
      const total = result?.pagination?.total ?? result?.total ?? result?.data?.total ?? rawData.length;
      return { data: rawData, total };
    }

    // Case 3: { data: {...} } with pagination metadata
    if (rawData && typeof rawData === "object") {
      const items = rawData.items ?? rawData.rows ?? rawData.records ?? rawData.results ?? Object.values(rawData).find(Array.isArray);
      if (Array.isArray(items)) {
        return { data: items, total: rawData.total ?? rawData.count ?? items.length };
      }
    }

    // Fallback
    return { data: [], total: 0 };
  };

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFnRef.current({ limit, skip: (currentPage - 1) * limit });
      const extracted = extractData(result);

      setData(extracted.data);
      setTotalItems(extracted.total);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to fetch data");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit]);

  useEffect(() => {
    refetch();
  }, [refetch, ...refreshDeps]);

  return {
    data,
    loading,
    error,
    page: currentPage,
    totalPages,
    totalItems,
    limit,
    setPage,
    nextPage,
    prevPage,
    refetch,
  };
};
