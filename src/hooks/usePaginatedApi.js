import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Hook for paginated API calls with URL query param sync.
 *
 * @param {Function} fetchFn - The service function to call, receives { limit, skip }.
 * @param {Object} options
 * @param {number} options.defaultLimit - Items per page (default 20).
 * @param {number} options.defaultPage - Starting page (default 1).
 * @param {string} options.pageParam - URL param name for page (default "page").
 * @returns {{ data, loading, error, page, totalPages, totalItems, setPage, nextPage, prevPage, refetch }}
 */
export const usePaginatedApi = (fetchFn, options = {}) => {
  const { defaultLimit = 20, defaultPage = 1, pageParam = "page" } = options;
  const [searchParams, setSearchParams] = useSearchParams();

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

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const skip = (currentPage - 1) * limit;
      const result = await fetchFn({ limit, skip });
      // Support both { data: [...], total: N } and direct array returns
      if (Array.isArray(result)) {
        setData(result);
        setTotalItems(result.length);
      } else if (result?.data) {
        setData(result.data);
        setTotalItems(result.total ?? result.data?.length ?? 0);
      } else {
        setData([]);
        setTotalItems(0);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to fetch data");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, currentPage, limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

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
