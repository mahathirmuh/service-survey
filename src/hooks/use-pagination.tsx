import { useState, useMemo, useCallback } from 'react';

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
}

export interface PaginationActions {
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
}

export interface PaginationConfig {
  totalItems: number;
  initialPageSize?: number;
  initialPage?: number;
}

export interface UsePaginationReturn {
  state: PaginationState;
  actions: PaginationActions;
  paginateData: <T>(data: T[]) => T[];
}

export const usePagination = ({
  totalItems,
  initialPageSize = 10,
  initialPage = 1,
}: PaginationConfig): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const state = useMemo((): PaginationState => {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const validCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = (validCurrentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

    return {
      currentPage: validCurrentPage,
      pageSize,
      totalItems,
      totalPages,
      startIndex,
      endIndex,
    };
  }, [currentPage, pageSize, totalItems]);

  const setPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, state.totalPages));
    setCurrentPage(validPage);
  }, [state.totalPages]);

  const setPageSizeAndResetPage = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  const nextPage = useCallback(() => {
    setPage(state.currentPage + 1);
  }, [setPage, state.currentPage]);

  const previousPage = useCallback(() => {
    setPage(state.currentPage - 1);
  }, [setPage, state.currentPage]);

  const firstPage = useCallback(() => {
    setPage(1);
  }, [setPage]);

  const lastPage = useCallback(() => {
    setPage(state.totalPages);
  }, [setPage, state.totalPages]);

  const paginateData = useCallback(<T,>(data: T[]): T[] => {
    const start = state.startIndex;
    const end = start + state.pageSize;
    return data.slice(start, end);
  }, [state.startIndex, state.pageSize]);

  const actions: PaginationActions = {
    setPage,
    setPageSize: setPageSizeAndResetPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
  };

  return {
    state,
    actions,
    paginateData,
  };
};

// Utility function for paginating data without the hook
export const paginateData = <T,>(data: T[], currentPage: number, pageSize: number): T[] => {
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return data.slice(startIndex, endIndex);
};

export default usePagination;