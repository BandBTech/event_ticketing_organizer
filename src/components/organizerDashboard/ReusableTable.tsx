"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import TablePagination from "@/components/organizerDashboard/TablePagination";
import { useTranslation } from "@/hooks/useTranslation";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReusableTableProps<TData, TValue> {
  wrapperClassName?: string;
  // Table Core
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;

  // Custom Slots
  headerComponent?: React.ReactNode;
  emptyState?: React.ReactNode;

  // Sorting Props
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (
    sortBy: string | undefined,
    sortOrder: "asc" | "desc" | undefined,
  ) => void;

  // Pagination Props
  currentPage: number;
  totalPages: number;
  total?: number;
  limit?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;

  // Row click handler
  onRowClick?: (row: TData) => void;
}

export function ReusableTable<TData, TValue>({
  columns,
  data,
  wrapperClassName,
  isLoading = false,
  headerComponent,
  emptyState,
  sortBy,
  sortOrder,
  onSortChange,
  currentPage,
  totalPages,
  total,
  limit,
  hasNextPage = false,
  hasPreviousPage = false,
  onPageChange,
  onLimitChange,
  onRowClick,
}: ReusableTableProps<TData, TValue>) {
  const { t } = useTranslation();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  const handleHeaderClick = (sortKey: string) => {
    if (!onSortChange) return;

    if (sortBy !== sortKey) {
      // New column — start with asc
      onSortChange(sortKey, "asc");
    } else if (sortOrder === "asc") {
      // Same column, was asc → switch to desc
      onSortChange(sortKey, "desc");
    } else {
      // Same column, was desc → clear sort
      onSortChange(undefined, undefined);
    }
  };

  const renderSortIcon = (sortKey: string) => {
    if (sortBy === sortKey) {
      if (sortOrder === "asc") {
        return <ArrowUp className="w-3.5 h-3.5 ml-1 text-blue-600" />;
      }
      return <ArrowDown className="w-3.5 h-3.5 ml-1 text-blue-600" />;
    }
    return <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-gray-400" />;
  };

  const renderEmptyState = () => {
    if (emptyState) return emptyState;
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-gray-50 p-4 rounded-full mb-4">
          <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          {t("common.noData", "No data found")}
        </h3>
        <p className="text-gray-500 mt-1 max-w-sm">
          {t("common.noDataDescription", "There are no records to display.")}
        </p>
      </div>
    );
  };

  return (
    <>
      {headerComponent}

      <div className={cn("w-full", wrapperClassName)}>
        <Table>
          <TableHeader className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const sortKey = (
                    header.column.columnDef.meta as { sortKey?: string }
                  )?.sortKey;
                  const isSortable = !!sortKey && !!onSortChange;
                  const isActive = sortBy === sortKey;

                  const headerClassName = (
                    header.column.columnDef.meta as { headerClassName?: string }
                  )?.headerClassName;

                  return (
                    <TableHead
                      key={header.id}
                      className={`text-gray-500 font-medium whitespace-nowrap ${
                        isSortable
                          ? "cursor-pointer select-none group/sortable hover:text-gray-700 transition-colors"
                          : ""
                      } ${headerClassName ?? ""}`}
                      onClick={
                        isSortable
                          ? () => handleHeaderClick(sortKey)
                          : undefined
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <span className="inline-flex items-center">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {isSortable && renderSortIcon(sortKey)}
                        </span>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: limit || 10 }).map((_, rowIndex) => (
                <TableRow key={`skeleton-row-${rowIndex}`}>
                  {columns.map((_, colIndex) => (
                    <TableCell
                      key={`skeleton-col-${colIndex}`}
                      className="py-4"
                    >
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0">
                  {renderEmptyState()}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={`group hover:bg-gray-50/50 transition-colors border-gray-100 ${onRowClick ? "cursor-pointer" : ""}`}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && data.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50/30 rounded-b-2xl mt-auto">
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onLimitChange={onLimitChange}
            hasNext={hasNextPage}
            hasPrev={hasPreviousPage}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </>
  );
}
