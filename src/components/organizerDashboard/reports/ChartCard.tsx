"use client";

import { ChartLineIcon } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
}

export function ChartCard({
  title,
  children,
  isLoading = false,
  isEmpty = false,
  emptyMessage = "No data available for this period",
}: ChartCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : isEmpty ? (
        <div className="h-64 flex flex-col items-center justify-center text-gray-400">
          <ChartLineIcon className="w-10 h-10 mb-2" weight="duotone" />
          <p className="text-sm">{emptyMessage}</p>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
