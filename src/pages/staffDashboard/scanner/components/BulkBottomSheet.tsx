import { TrashIcon, PaperPlaneRightIcon } from "@phosphor-icons/react";
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
            <p className="text-sm text-gray-600">{pendingCheckInLabel}</p>
          </div>
          <Button variant="ghost" size="sm">
            {showList ? hideListLabel : viewListLabel}
          </Button>
        </div>

        {/* Expandable ticket list */}
        {showList && (
          <div className="max-h-48 overflow-y-auto mb-4 border rounded-lg divide-y">
            {queue.map((item, idx) => (
              <div
                key={idx}
                className="p-3 flex items-center justify-between bg-gray-50 text-sm"
              >
                <span className="font-mono text-gray-700">{item.code}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem(idx);
                  }}
                  className="text-red-500 p-1"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Action row */}
        <div className="flex gap-2">
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            <PaperPlaneRightIcon size={18} weight="fill" />
            {submitLabel}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-red-500 border-red-200 hover:bg-red-50"
            onClick={onClear}
          >
            <TrashIcon size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
