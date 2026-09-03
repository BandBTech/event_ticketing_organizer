import {
  TrashIcon,
  PaperPlaneRightIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { AnimatePresence, motion } from "framer-motion";
import type { BulkScanItem } from "@/hooks/useScannerState";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";

interface BulkBottomSheetProps {
  queue: BulkScanItem[];
  showList: boolean;
  isSubmitting: boolean;
  onToggleList: () => void;
  onRemoveItem: (index: number) => void;
  onSubmit: () => void;
  onClear: () => void;
  onRetryFailed: () => void;
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
  onRetryFailed,
  inQueueLabel,
  pendingCheckInLabel,
  viewListLabel,
  hideListLabel,
  submitLabel,
}: BulkBottomSheetProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  if (queue.length === 0) return null;

  const isSubmitted = queue.some((item) => item.checkinResult !== undefined);
  const successCount = queue.filter((item) => item.checkinResult === "success").length;
  const failedCount = queue.filter((item) => item.checkinResult === "failed").length;
  const hasFailed = failedCount > 0;

  return (
    <Drawer open={true} modal={false} dismissible={false}>
      <DrawerContent className="z-20 focus:outline-none mb-0 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.25)] bg-gray-900 border-t border-white/10 text-white rounded-t-[24px] outline-none">
        <div className="p-4 pt-2">
          {/* Header row */}
          <div
            className="flex items-center justify-between mb-4 cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={onToggleList}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onToggleList();
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className={`font-bold px-3 py-1 rounded-full text-xs ${
                  isSubmitted
                    ? hasFailed
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-green-500/20 text-green-300 border border-green-500/30"
                    : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                }`}
              >
                {isSubmitted
                  ? `${successCount} Checked In • ${failedCount} Failed`
                  : `${queue.length} ${inQueueLabel}`}
              </div>
              <p className="text-xs text-gray-400 truncate max-w-[160px] sm:max-w-none">
                {isSubmitted ? "Review Results" : pendingCheckInLabel}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white hover:bg-white/10 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onToggleList();
              }}
            >
              {showList ? hideListLabel : viewListLabel}
            </Button>
          </div>

          {/* Ticket list keyed by item.code */}
          <AnimatePresence initial={false}>
            {showList && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="max-h-60 overflow-y-auto mb-4 border border-white/10 rounded-xl divide-y divide-white/5 bg-gray-950/60">
                  {queue.map((item, idx) => (
                    <div
                      key={item.code}
                      className="p-3 flex items-center justify-between text-sm hover:bg-white/5 transition-colors"
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white line-clamp-1 max-w-[120px] sm:max-w-[200px]">
                            {item.attendeeName || "Guest User"}
                          </span>
                          <span className="text-xs font-mono text-gray-400 bg-white/10 px-1.5 py-0.5 rounded">
                            {item.ticketNumber || item.code.slice(0, 10)}
                          </span>
                        </div>
                        {item.checkinMessage && (
                          <span
                            className={`text-xs ${
                              item.checkinResult === "failed" ? "text-red-400" : "text-gray-400"
                            }`}
                          >
                            {item.checkinMessage}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.checkinResult === "success" && (
                          <CheckCircleIcon size={24} weight="fill" className="text-green-400" />
                        )}
                        {item.checkinResult === "failed" && (
                          <div className="flex items-center gap-1.5">
                            <XCircleIcon size={24} weight="fill" className="text-red-400" />
                            {/* Allow deleting failed item to clean queue for retry */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveItem(idx);
                              }}
                              className="text-gray-400 hover:text-red-400 p-1.5 rounded-full transition-colors"
                              aria-label="Remove failed ticket"
                            >
                              <TrashIcon size={16} />
                            </button>
                          </div>
                        )}
                        {!item.checkinResult && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveItem(idx);
                            }}
                            className="text-gray-400 hover:text-red-400 p-1.5 rounded-full transition-colors"
                            aria-label="Remove ticket"
                          >
                            <TrashIcon size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-2">
            {isSubmitted ? (
              hasFailed ? (
                <>
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 rounded-xl text-sm"
                    onClick={onRetryFailed}
                  >
                    {t("staffScanner.retryFailed", "Retry Failed")}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-red-400 border-red-500/30 hover:bg-red-500/10 h-11 w-11 rounded-xl shrink-0"
                    onClick={onClear}
                  >
                    <TrashIcon size={18} />
                  </Button>
                </>
              ) : (
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-11 rounded-xl text-sm"
                  onClick={onClear}
                >
                  {t("common.done", "Done")}
                </Button>
              )
            ) : (
              <>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2 h-11 rounded-xl font-bold text-sm"
                  onClick={onSubmit}
                  disabled={isSubmitting}
                >
                  <PaperPlaneRightIcon size={18} weight="fill" />
                  {submitLabel}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-red-400 border-red-500/30 hover:bg-red-500/10 h-11 w-11 rounded-xl shrink-0"
                  onClick={onClear}
                >
                  <TrashIcon size={18} />
                </Button>
              </>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default BulkBottomSheet;