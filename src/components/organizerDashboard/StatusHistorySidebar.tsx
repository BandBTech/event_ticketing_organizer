import { useState, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { EventStatusHistory } from "@/types/event";
import { formatDateTime } from "@/lib/utils";
import {
  Circle,
  User,
  ChatCircle,
  CaretDown,
  CaretUp,
  CheckCircle,
  XCircle,
  PauseCircle,
  PlayCircle,
  StopCircle,
} from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface StatusHistorySidebarProps {
  history: EventStatusHistory[];
  isLoading?: boolean;
}

export default function StatusHistorySidebar({
  history,
  isLoading,
}: StatusHistorySidebarProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const historyList = useMemo(() => {
    let list: EventStatusHistory[] = [];
    if (Array.isArray(history)) {
      list = history;
    } else if (history && typeof history === "object") {
      const h = history as Record<string, unknown>;
      list = Array.isArray(h.history)
        ? (h.history as EventStatusHistory[])
        : Array.isArray(h.items)
          ? (h.items as EventStatusHistory[])
          : Array.isArray(h.data)
            ? (h.data as EventStatusHistory[])
            : [];
    }

    return list.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [history]);

  const displayItems = useMemo(() => {
    if (historyList.length <= 4 || isExpanded) return historyList;
    const firstThree = historyList.slice(0, 3);
    const lastOne = historyList[historyList.length - 1];
    return [...firstThree, "DIVIDER", lastOne];
  }, [historyList, isExpanded]);

  const getStatusIcon = (status: string, type: string) => {
    if (type === "sales") {
      if (status === "paused")
        return <PauseCircle size={16} className="text-amber-500" />;
      if (status === "active" || status === "resumed")
        return <PlayCircle size={16} className="text-green-500" />;
      if (status === "stopped")
        return <StopCircle size={16} className="text-red-500" />;
    }

    switch (status) {
      case "approved":
        return <CheckCircle size={16} className="text-emerald-500" />;
      case "rejected":
        return <XCircle size={16} className="text-red-500" />;
      case "cancelled":
        return <XCircle size={16} className="text-red-500" />;
      case "pending":
        return <Circle size={16} weight="fill" className="text-amber-500" />;
      case "draft":
        return <Circle size={16} className="text-gray-500" />;
      default:
        return <Circle size={16} className="text-blue-500" />;
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "pending":
        return "border-yellow-600 bg-yellow-700 text-yellow-100";
      case "approved":
        return "border-green-600 bg-green-700 text-green-100";
      case "rejected":
        return "border-red-600 bg-red-700 text-red-100";
      case "cancelled":
        return "border-red-600 bg-red-700 text-white";
      case "draft":
        return "border-gray-600 bg-gray-700 text-gray-100";
      case "completed":
        return "border-slate-600 bg-slate-700 text-slate-100";
      case "on_sale":
        return "border-green-600 bg-green-700 text-green-100";
      case "live":
        return "border-green-600 bg-green-100 text-green-700";
      case "hold":
        return "border-amber-600 bg-amber-700 text-amber-100";
      case "scheduled":
        return "border-blue-600 bg-blue-700 text-blue-100";
      case "sold_out":
        return "border-red-600 bg-red-700 text-red-100";
      case "sales_end":
        return "border-red-300 bg-red-200 text-red-800";
      default:
        return "border-amber-200 bg-amber-50 text-amber-700";
    }
  };

  const getStatusLabel = (status: string) => {
    return t(`event.badge.${status}`, status);
  };

  if (isLoading) {
    return (
      <div className="glass-card-lowest rounded-2xl p-6 shadow-sm space-y-4 max-h-[600px] overflow-hidden">
        <h3 className="text-lg font-semibold flex items-center gap-2 sticky top-0 bg-white pb-2 z-20">
          {t("event.section.statusHistory", "Status History")}
        </h3>
        <div className="relative space-y-6 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative pl-10">
              <div className="absolute left-0 -top-1 w-8 h-8 flex items-center justify-center rounded-full bg-white border-2 border-slate-100 z-10">
                <Skeleton className="w-4 h-4 rounded-full" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2 text-xs">
                  <Skeleton className="h-3 w-4" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!historyList || historyList.length === 0) {
    return (
      <div className="glass-card-lowest rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {t("event.section.statusHistory", "Status History")}
        </h3>
        <p className="text-gray-500 text-sm">
          {t(
            "event.text.noStatusHistory",
            "No status changes recorded for this event.",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card-lowest rounded-2xl p-6 shadow-sm space-y-4 @container">
      <h3 className="text-lg font-semibold flex items-center gap-2 pb-2 z-20">
        {t("event.section.statusHistory", "Status History")}
      </h3>

      <div className="relative space-y-6 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent max-h-[600px] overflow-y-auto pr-2">
        {displayItems.map((item, index) => {
          if (item === "DIVIDER") {
            return (
              <div key="divider" className="relative pl-10 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(true)}
                  className="h-6 -ml-10 mt-8 mb-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-500 px-3 flex gap-1 items-center shadow-sm w-fit"
                >
                  <CaretDown size={12} />
                  {t("common.button.viewMore", "View {count} more").replace(
                    "{count}",
                    (historyList.length - 4).toString(),
                  )}
                </Button>
              </div>
            );
          }

          const historyItem = item as EventStatusHistory;

          return (
            <div key={historyItem.id} className="relative pl-10 group">
              <div className="absolute left-0 -top-1 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 border border-gray-100 group-last:border-emerald-500 z-10">
                {getStatusIcon(historyItem.new_status, historyItem.status_type)}
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex flex-col gap-1 @sm:flex-row @sm:items-center @sm:justify-between">
                  <Badge
                    variant="outline"
                    className={`uppercase text-[10px] px-1.5 py-0 font-semibold rounded-full ${getStatusBadgeStyles(historyItem.new_status)}`}
                  >
                    {historyItem.new_status === "live" && (
                      <span className="flex h-1.5 w-1.5 relative mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                    )}
                    {getStatusLabel(historyItem.new_status)}
                  </Badge>
                  <span className="text-[12px] text-gray-400">
                    {formatDateTime(historyItem.created_at)}
                  </span>
                </div>

                <div className="text-sm font-medium text-gray-700">
                  {historyItem.status_type === "approval"
                    ? t(
                        "event.history.statusChanged",
                        "Status updated from {old} to {new}",
                      )
                        .replace("{old}", historyItem.old_status)
                        .replace("{new}", historyItem.new_status)
                    : t("event.history.salesChanged", "Sales {new}").replace(
                        "{new}",
                        historyItem.new_status,
                      )}
                </div>

                <div className="flex items-center gap-1 mt-1 text-[12px] text-gray-400">
                  <User size={10} />
                  <span>
                    {historyItem.changed_by_name ||
                      t("common.text.system", "System")}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isExpanded && historyList.length > 4 && (
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="text-xs text-slate-400 hover:text-slate-600 flex gap-1 h-auto py-1"
          >
            <CaretUp size={12} />
            {t("common.button.showLess", "Show Less")}
          </Button>
        </div>
      )}
    </div>
  );
}
