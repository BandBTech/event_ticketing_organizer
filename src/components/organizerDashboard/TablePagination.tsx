"use client";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import {
  CaretLeft,
  CaretRight,
  CaretDoubleLeft,
  CaretDoubleRight,
  CaretDoubleLeftIcon,
  CaretRightIcon,
  CaretDoubleRightIcon,
} from "@phosphor-icons/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/ssr";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  total?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  onPageChange: (page: number) => void;
  className?: string;
  limit?: number;
  onLimitChange?: (limit: number) => void;
}

export default function TablePagination({
  currentPage,
  totalPages,
  total,
  onPageChange,
  limit,
  onLimitChange,
  className = "",
}: TablePaginationProps) {
  const { t } = useTranslation();

  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const handleFirst = () => {
    if (currentPage > 1) onPageChange(1);
  };

  const handleLast = () => {
    if (currentPage < totalPages && totalPages > 0) onPageChange(totalPages);
  };

  // Build page numbers to show (current ± 1, always show first and last)
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, i) => i + 1,
  ).filter(
    (page) =>
      page === 1 ||
      page === totalPages ||
      (page >= currentPage - 1 && page <= currentPage + 1),
  );

  const pagesWithEllipsis: (number | "...")[] = [];
  let lastPage = 0;
  for (const page of pageNumbers) {
    if (lastPage && page - lastPage > 1) {
      pagesWithEllipsis.push("...");
    }
    pagesWithEllipsis.push(page);
    lastPage = page;
  }

  const startItem =
    total && total > 0 ? (currentPage - 1) * (limit || 10) + 1 : 0;
  const endItem =
    total && total > 0 ? Math.min(currentPage * (limit || 10), total) : 0;

  return (
    <div
      className={`flex items-center justify-between py-4 px-4 w-full ${className}`}
    >
      <div className="flex items-center gap-3">
        {onLimitChange && limit ? (
          <>
            <span className="text-sm font-medium text-gray-600">
              {t("common.rowsPerPage", "Rows per page")}
            </span>
            <Select
              value={limit.toString()}
              onValueChange={(val) => onLimitChange(Number(val))}
            >
              <SelectTrigger className="h-8 w-[70px] bg-white text-sm">
                <SelectValue placeholder={String(limit)} />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((pageSize) => (
                  <SelectItem
                    key={pageSize}
                    value={pageSize.toString()}
                    className="cursor-pointer"
                  >
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        ) : null}
        {total !== undefined && limit !== undefined && total > 0 ? (
          <span className="ml-4 text-sm font-medium text-gray-600">
            {t(
              "common.startItemToEndItemOfTotal",
              `${startItem}-${endItem} of ${total}`,
              {
                startItem,
                endItem,
                total,
              },
            )}
          </span>
        ) : null}
        <span className="text-sm font-medium text-gray-600">
          {t("common.results", "Results")}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFirst}
            disabled={currentPage === 1 || totalPages === 0}
            className="h-8 w-8 text-gray-500 hover:text-gray-900"
          >
            <CaretDoubleLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            disabled={currentPage === 1 || totalPages === 0}
            className="h-8 w-8 text-gray-500 hover:text-gray-900"
          >
            <CaretLeftIcon className="h-4 w-4" />
          </Button>

          <div className="flex gap-1 mx-2">
            {pagesWithEllipsis.map((item, idx) =>
              item === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="flex items-center justify-center w-6 text-gray-400 text-sm"
                >
                  ..
                </span>
              ) : (
                <Button
                  key={item}
                  variant="ghost"
                  size="sm"
                  onClick={() => onPageChange(item as number)}
                  className={`h-8 min-w-8 p-0 text-sm hover:bg-gray-100 rounded-md ${
                    currentPage === item
                      ? "font-bold text-white cursor-default! bg-primary hover:bg-primary-700 hover:text-white"
                      : "font-medium text-gray-500"
                  }`}
                >
                  {item}
                </Button>
              ),
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={currentPage === totalPages || totalPages === 0}
            className="h-8 w-8 text-gray-500 hover:text-gray-900"
          >
            <CaretRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLast}
            disabled={currentPage === totalPages || totalPages === 0}
            className="h-8 w-8 text-gray-500 hover:text-gray-900"
          >
            <CaretDoubleRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
