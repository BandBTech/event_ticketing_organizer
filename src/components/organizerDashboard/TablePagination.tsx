"use client";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  total?: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: TablePaginationProps) {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  const goToPrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const goToNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
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

  return (
    <div
      className={`flex items-center justify-center space-x-2 py-4 ${className}`}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={goToPrevious}
        disabled={currentPage === 1}
        className="h-8 rounded-full px-4"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        {t("common.previous", "Previous")}
      </Button>

      <div className="flex gap-2">
        {pagesWithEllipsis.map((item, idx) =>
          item === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="flex items-center justify-center w-8 text-gray-400"
            >
              ...
            </span>
          ) : (
            <Button
              key={item}
              variant={currentPage === item ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(item as number)}
              className={`h-8 w-8 rounded-full p-0 ${
                currentPage === item
                  ? "bg-blue-600 hover:bg-blue-700 border-blue-600 text-white"
                  : ""
              }`}
            >
              {item}
            </Button>
          ),
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={goToNext}
        disabled={currentPage === totalPages}
        className="h-8 rounded-full px-4"
      >
        {t("common.next", "Next")}
        <ArrowRightIcon className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}
