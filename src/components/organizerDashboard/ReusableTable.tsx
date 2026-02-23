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

export interface ReusableTableProps<TData, TValue> {
  // Table Core
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;

  // Custom Slots
  headerComponent?: React.ReactNode;
  emptyState?: React.ReactNode;

  // Pagination Props
  currentPage: number;
  totalPages: number;
  total?: number;
  limit?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export function ReusableTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  headerComponent,
  emptyState,
  currentPage,
  totalPages,
  total,
  limit,
  hasNextPage = false,
  hasPreviousPage = false,
  onPageChange,
  onLimitChange,
}: ReusableTableProps<TData, TValue>) {
  const { t } = useTranslation();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

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

      <div className="w-full">
        <Table>
          <TableHeader className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-gray-500 font-medium whitespace-nowrap"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
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
                  className="group hover:bg-gray-50/50 transition-colors border-gray-100"
                  data-state={row.getIsSelected() && "selected"}
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
    </>
  );
}
