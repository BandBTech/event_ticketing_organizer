import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import type { ScanMode } from "@/hooks/useScannerState";

interface ScannerHeaderProps {
  mode: ScanMode;
  bulkCount: number;
  onModeChange: (mode: ScanMode) => void;
  singleLabel: string;
  bulkLabel: string;
  eventTitle?: string | null;
}

export function ScannerHeader({
  mode,
  bulkCount,
  onModeChange,
  singleLabel,
  bulkLabel,
  eventTitle,
}: ScannerHeaderProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-20 p-4 max-md:bg-linear-to-b from-black/80 to-transparent">
      <div className="flex items-center justify-between">
        <Link href="/staffDashboard">
          <Button
            variant="ghost"
            size="icon"
            className="text-white md:text-black hover:bg-white/20"
          >
            <ArrowLeftIcon weight="bold" className="size-6" />
          </Button>
        </Link>

        {/* Mode toggle pill */}
        <div className="bg-black/50 backdrop-blur-sm rounded-full p-1 flex border border-white/10">
          <button
            onClick={() => onModeChange("single")}
            className={`px-4 py-1.5 rounded-full font-medium transition-all ${
              mode === "single"
                ? "bg-white text-black shadow-sm"
                : "text-white/80 hover:text-white"
            }`}
          >
            {singleLabel}
          </button>
          <button
            onClick={() => onModeChange("bulk")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              mode === "bulk"
                ? "bg-white text-black shadow-sm"
                : "text-white/80 hover:text-white"
            }`}
          >
            {bulkLabel} ({bulkCount})
          </button>
        </div>

        {/* Spacer to keep the toggle centred */}
        <div className="w-10" />
      </div>

      {/* Event title badge */}
      {eventTitle && (
        <div className="flex justify-center mt-3 md:mt-6">
          <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-1.5 flex items-center gap-2 border border-white/10">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-white/90 text-sm font-medium truncate max-w-[220px]">
              {eventTitle}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScannerHeader;
