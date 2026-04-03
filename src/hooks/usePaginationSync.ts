"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface UsePaginationSyncOptions {
  defaultPage?: number;
  defaultLimit?: number;
}

interface UsePaginationSyncReturn {
  currentPage: number;
  limit: number;
  handlePageChange: (page: number) => void;
  handleLimitChange: (newLimit: number) => void;
}

/**
 * Syncs pagination state with URL search params.
 * URL is the single source of truth — enables shareable links,
 * browser back/forward, and refresh persistence.
 */
export function usePaginationSync({
  defaultPage = 1,
  defaultLimit = 10,
}: UsePaginationSyncOptions = {}): UsePaginationSyncReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = useMemo(
    () => Number(searchParams.get("page")) || defaultPage,
    [searchParams, defaultPage],
  );

  const limit = useMemo(
    () => Number(searchParams.get("limit")) || defaultLimit,
    [searchParams, defaultLimit],
  );

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (!value) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateParams({ page: page.toString() });
    },
    [updateParams],
  );

  const handleLimitChange = useCallback(
    (newLimit: number) => {
      updateParams({ limit: newLimit.toString(), page: "1" });
    },
    [updateParams],
  );

  return {
    currentPage,
    limit,
    handlePageChange,
    handleLimitChange,
  };
}
