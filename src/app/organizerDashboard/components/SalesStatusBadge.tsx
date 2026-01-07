"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SalesStatusBadgeProps {
  status?: string;
  className?: string;
  showAlways?: boolean;
}

const salesStatusColors: Record<string, string> = {
  'active': 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50',
  'paused': 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50',
  'stopped': 'bg-red-50 text-red-700 border-red-200 hover:bg-red-50',
  'sold_out': 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50',
  'sales_ended': 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-50',
};

function getSalesStatusLabel(status: string): string {
  switch (status) {
    case "active":
      return "SALES LIVE";
    case "paused":
      return "SALES PAUSED";
    case "stopped":
      return "SALES STOPPED";
    case "sold_out":
      return "SOLD OUT";
    case "sales_ended":
        return "SALES ENDED";
    default:
      return status.replace('_', ' ').toUpperCase();
  }
}

export function SalesStatusBadge({ status, className, showAlways = false }: SalesStatusBadgeProps) {
  if (!status && !showAlways) return null;
  
  const displayStatus = status || "";

  return (
    <Badge
      variant="outline"
      className={cn(
        "uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shadow-sm border text-[10px] flex items-center gap-1.5",
        salesStatusColors[displayStatus] || "bg-blue-50 text-gray-700 border-gray-200 hover:bg-gray-50",
        className
      )}
    >
      {displayStatus === 'active' && (
        <span className="flex h-1.5 w-1.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
        </span>
      )}
      {getSalesStatusLabel(displayStatus)}
    </Badge>
  );
}
