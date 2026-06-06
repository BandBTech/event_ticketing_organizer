"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/store/languageStore";

interface EventStatusBadgeProps {
  status?: string;
  className?: string;
}

const eventStatusConfig: Record<
  string,
  {
    color: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  pending: {
    color: "bg-yellow-700 text-yellow-100 border-yellow-600",
    variant: "secondary",
  },
  approved: {
    color: "bg-green-700 text-green-100 border-green-600",
    variant: "secondary",
  },
  rejected: {
    color: "bg-red-700! text-red-100 border-red-600",
    variant: "destructive",
  },
  cancelled: {
    color: "bg-red-700 text-white border-red-600",
    variant: "destructive",
  },
  draft: {
    color: "bg-gray-700 text-gray-100 border-gray-600",
    variant: "secondary",
  },
  completed: {
    color: "bg-slate-700 text-slate-100 border-slate-600",
    variant: "secondary",
  },
  default: {
    color: "bg-gray-700 text-gray-100 border-gray-600",
    variant: "secondary",
  },
  on_sale: {
    color: "bg-green-700 text-green-100 border-green-600",
    variant: "secondary",
  },
  live: {
    color: "bg-green-100 text-green-700 border-green-600",
    variant: "secondary",
  },
  hold: {
    color: "bg-amber-700 text-amber-100 border-amber-600",
    variant: "secondary",
  },
  scheduled: {
    color: "bg-blue-700 text-blue-100 border-blue-600",
    variant: "secondary",
  },
  cancel_pending: {
    color: "bg-yellow-200 text-orange-800 border-amber-400",
    variant: "secondary",
  },
  sold_out: {
    color: "bg-red-700 text-red-100 border-red-600",
    variant: "destructive",
  },
  sales_end: {
    color: "bg-red-200 text-red-800 border-red-300",
    variant: "secondary",
  },
  sales_upcoming: {
    color: "bg-blue-200 text-blue-800 border-blue-300",
    variant: "secondary",
  },
};

export function EventStatusBadge({ status, className }: EventStatusBadgeProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  if (!status) return null;

  const normalizedStatus = status.toLowerCase();
  const config = eventStatusConfig[normalizedStatus] || eventStatusConfig["default"];

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "uppercase px-3 py-1 flex items-center gap-1.5 font-semibold rounded-full",
        config.color,
        className,
      )}
    >
      {normalizedStatus === "live" && (
        <span className="flex h-1.5 w-1.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
        </span>
      )}
      {t(`event.badge.${normalizedStatus}`, status)}
    </Badge>
  );
}
