import {
  TrashIcon,
  PaperPlaneRightIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import type { BulkScanItem } from "../useScannerState";

interface BulkBottomSheetProps {
  queue: BulkScanItem[];
  showList: boolean;
  isSubmitting: boolean;
  onToggleList: () => void;
  onRemoveItem: (index: number) => void;
  onSubmit: () => void;
  onClear: () => void;
  // Labels
  inQueueLabel: string;
  pendingCheckInLabel: string;
  viewListLabel: string;
  hideListLabel: string;
  submitLabel: string;
}

export function BulkBottomSheet({
  queue,
  showList,
  isSubmitting,
  onToggleList,
  onRemoveItem,
  onSubmit,
  onClear,
  inQueueLabel,
  pendingCheckInLabel,
  viewListLabel,
  hideListLabel,
  submitLabel,
}: BulkBottomSheetProps) {
  if (queue.length === 0) return null;

  const isSubmitted = queue.some((item) => item.checkinResult !== undefined);

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] z-20 pb-safe">
      <div className="p-4">
        {/* Header row — tappable to expand/collapse */}
        <div
          className="flex items-center justify-between mb-4 cursor-pointer"
          onClick={onToggleList}
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-sm">
              {queue.length} {inQueueLabel}
            </div>
            <p className="text-sm text-gray-600">
              {isSubmitted ? "Bulk check-in results" : pendingCheckInLabel}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="max-md:hidden">
            {showList ? hideListLabel : viewListLabel}
          </Button>
        </div>

        {/* Expandable ticket list */}
        {showList && (
          <div className="max-h-60 overflow-y-auto mb-4 border rounded-lg divide-y bg-gray-50/50">
            {queue.map((item, idx) => (
              <div
                key={idx}
                className="p-3 flex items-center justify-between bg-white text-sm"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">
                      {item.attendeeName || "Guest User"}
                    </span>
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      {item.ticketNumber}
                    </span>
                  </div>
                  {item.checkinMessage && (
                    <span
                      className={`text-xs ${item.checkinResult === "failed" ? "text-red-500" : "text-gray-500"}`}
                    >
                      {item.checkinMessage}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {item.checkinResult === "success" && (
                    <CheckCircleIcon
                      size={24}
                      weight="fill"
                      className="text-green-500"
                    />
                  )}
                  {item.checkinResult === "failed" && (
                    <XCircleIcon
                      size={24}
                      weight="fill"
                      className="text-red-500"
                    />
                  )}
                  {!item.checkinResult && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveItem(idx);
                      }}
                      className="text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <TrashIcon size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action row */}
        <div className="flex gap-2">
          {isSubmitted ? (
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-12"
              onClick={onClear}
            >
              Done
            </Button>
          ) : (
            <>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2 h-12 font-bold"
                onClick={onSubmit}
                disabled={isSubmitting}
              >
                <PaperPlaneRightIcon size={18} weight="fill" />
                {submitLabel}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="text-red-500 border-red-200 hover:bg-red-50 h-12 w-12 shrink-0"
                onClick={onClear}
              >
                <TrashIcon size={18} />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
